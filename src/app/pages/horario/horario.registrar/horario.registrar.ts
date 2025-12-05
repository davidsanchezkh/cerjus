import { Component, inject } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { HorarioService } from '../services/horario.service';
import {
  DIAS_SEMANA,
  DiaSemana,
} from '../models/horario.dominio';
import {
  VMHorarioCreate,
  VMHorarioBloqueForm,
} from '../models/horario.vm';
import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';

type BloqueFormGroup = FormGroup<{
  dias: FormControl<DiaSemana[]>;
  horaInicio: FormControl<string>;
  horaFin: FormControl<string>;
}>;

@Component({
  selector: 'app-horario-registrar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './horario.registrar.html',
  styleUrl: './horario.registrar.css',
})
export class HorarioRegistrar {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private service = inject(HorarioService);
  private notify = inject(NotificacionesService);

  diasSemana = DIAS_SEMANA;

  form = this.fb.group({
    nombre: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(80)],
    }),
    tz: new FormControl<string>('America/Lima', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(64)],
    }),
    bloques: this.fb.array<BloqueFormGroup>([]),
  });

  get bloques(): FormArray<BloqueFormGroup> {
    return this.form.controls.bloques as FormArray<BloqueFormGroup>;
  }

  submitting = false;

  constructor() {
    // Bloque inicial por defecto
    this.addBloque();
  }

  addBloque() {
    const grupo: BloqueFormGroup = this.fb.group({
      dias: new FormControl<DiaSemana[]>([], { nonNullable: true }),
      // La obligatoriedad de horas se valida en validaBloques(), no con Validators.required
      horaInicio: new FormControl<string>('', { nonNullable: true }),
      horaFin: new FormControl<string>('', { nonNullable: true }),
    });

    this.bloques.push(grupo);
  }

  removeBloque(index: number) {
    if (this.bloques.length <= 1) return;

    // Eliminamos el grupo
    this.bloques.removeAt(index);

    // Forzamos recalcular valor/estado del FormArray
    this.bloques.markAsDirty();
    this.bloques.markAsTouched();
    this.bloques.updateValueAndValidity();
  }

  /** Maneja la selección/deselección de un día en el bloque i */
  onDiaChange(index: number, dia: DiaSemana, checked: boolean) {
    const bloque = this.bloques.at(index);
    if (!bloque) return;

    const diasControl = bloque.controls.dias;
    const current = diasControl.value ?? [];

    let next: DiaSemana[];

    if (checked) {
      if (current.includes(dia)) return;
      next = [...current, dia];
    } else {
      next = current.filter((d) => d !== dia);
    }

    diasControl.setValue(next);
    diasControl.markAsDirty();
    diasControl.markAsTouched();
  }

  /**
   * Reglas de negocio mínimas en cliente para los bloques.
   * Se ignoran bloques completamente vacíos (sin días y sin horas).
   */
  private validaBloques(bloques: VMHorarioBloqueForm[]): string | null {
    // Filtramos bloques "fantasma": sin días y sin horas
    const activos = (bloques ?? []).filter(
      (b) =>
        (b.dias && b.dias.length > 0) ||
        (b.horaInicio && b.horaInicio.trim() !== '') ||
        (b.horaFin && b.horaFin.trim() !== ''),
    );

    if (!activos || activos.length === 0) {
      return 'Debe definir al menos un bloque de días y horas.';
    }

    if (activos.some((b) => !b.dias || b.dias.length === 0)) {
      return 'Cada bloque debe tener al menos un día seleccionado.';
    }

    if (activos.some((b) => !b.horaInicio || !b.horaFin)) {
      return 'Cada bloque debe tener hora de inicio y hora de fin.';
    }

    const invalidHora = activos.some(
      (b) => (b.horaInicio || '') >= (b.horaFin || ''),
    );
    if (invalidHora) {
      return 'En cada bloque la hora de inicio debe ser menor que la hora de fin.';
    }

    return null;
  }

  async onSubmit() {
    // 1) Validación básica de cabecera (nombre, tz)
    const { nombre, tz } = this.form.controls;
    if (nombre.invalid || tz.invalid) {
      this.form.markAllAsTouched();
      await this.notify.ok({
        variant: 'warning',
        title: 'Datos incompletos',
        message: 'Revisa los campos obligatorios (nombre y zona horaria).',
        primaryText: 'Aceptar',
      });
      return;
    }

    const raw = this.form.getRawValue();

    const vm: VMHorarioCreate = {
      nombre: raw.nombre ?? '',
      tz: raw.tz ?? 'America/Lima',
      bloques: (raw.bloques ?? []).map(
        (b): VMHorarioBloqueForm => ({
          dias: b.dias ?? [],
          horaInicio: b.horaInicio ?? '',
          horaFin: b.horaFin ?? '',
        }),
      ),
    };

    // 2) Validación de negocio de bloques
    const msgBloques = this.validaBloques(vm.bloques);
    if (msgBloques) {
      // marcar los controles de bloques como tocados, opcional
      this.bloques.controls.forEach((g) => {
        Object.values(g.controls).forEach((c) => {
          c.markAsTouched();
          c.updateValueAndValidity({ onlySelf: true });
        });
      });

      await this.notify.ok({
        variant: 'warning',
        title: 'Falta información',
        message: msgBloques,
        primaryText: 'Aceptar',
      });
      return;
    }

    this.submitting = true;

    try {
      const createdId = await this.service.create(vm);

      await this.notify.ok({
        variant: 'success',
        title: 'Registro completado',
        message: 'El horario se creó correctamente.',
        primaryText: 'Ver horario',
      });

      this.router.navigate(['/horario', createdId]);
    } catch {
      // El interceptor global ya muestra el error adecuado
    } finally {
      this.submitting = false;
    }
  }

  /** Volver: si hay cambios sin guardar, confirmamos */
  async onBack() {
    if (this.form.dirty) {
      const ok = await this.notify.confirm({
        variant: 'warning',
        title: 'Descartar cambios',
        message: 'Hay datos sin guardar. ¿Deseas descartarlos?',
        confirmText: 'Descartar',
        cancelText: 'Seguir aquí',
      });
      if (!ok) return;
    }
    this.router.navigateByUrl('/horario');
  }
}
