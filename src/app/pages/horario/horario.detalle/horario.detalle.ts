import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormControl,
  FormGroup,
  FormArray,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { HorarioService } from '../services/horario.service';
import { VMHorarioDetalle, VMHorarioBloque, VMHorarioBloqueForm } from '../models/horario.vm';
import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';
import { PageMetaService } from '@/app/services/page_meta.service';

import { DIAS_SEMANA, DiaSemana } from '../models/horario.dominio';
import { DTOHorarioBloqueCreate } from '../models/horario.dto';

type BloqueFormGroup = FormGroup<{
  dias: FormControl<DiaSemana[]>;
  horaInicio: FormControl<string>;
  horaFin: FormControl<string>;
}>;

@Component({
  selector: 'app-horario-detalle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './horario.detalle.html',
  styleUrl: './horario.detalle.css',
})
export class HorarioDetalle implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(HorarioService);
  private fb = inject(FormBuilder);
  private notify = inject(NotificacionesService);
  private pageMeta = inject(PageMetaService);

  diasSemana = DIAS_SEMANA;

  private readonly diaOrder: Record<DiaSemana, number> = {
    LU: 0, MA: 1, MI: 2, JU: 3, VI: 4, SA: 5, DO: 6,
  };

  idhorario!: number;
  isEditing = false;
  open = true;
  submitting = false;

  // Tabla (modo lectura): un registro por día
  bloquesPlano: VMHorarioBloque[] = [];

  form = this.fb.group({
    nombre: new FormControl('', { nonNullable: true }),
    tz: new FormControl('', { nonNullable: true }),
    estado: new FormControl<number>(1, { nonNullable: true }), // 1=Activo, 2=Inactivo, 0=Eliminado
    bloques: this.fb.array<BloqueFormGroup>([]),
  });

  get bloquesFA(): FormArray<BloqueFormGroup> {
    return this.form.controls.bloques as FormArray<BloqueFormGroup>;
  }

  originalData!: VMHorarioDetalle;

  estadoLabel(v: number): string {
    if (v === 1) return 'Activo';
    if (v === 2) return 'Inactivo';
    if (v === 0) return 'Eliminado';
    return `Estado ${v}`;
  }

  estadoBadgeClass(v: number): string {
    if (v === 1) return 'bg-success';
    if (v === 2) return 'bg-warning text-dark';
    if (v === 0) return 'bg-danger';
    return 'bg-secondary';
  }

  ngOnInit(): void {
    this.form.disable();

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.service.getById(id).subscribe({
      next: (data: VMHorarioDetalle) => {
        this.idhorario = id;
        this.originalData = data;

        this.form.patchValue({
          nombre: data.nombre,
          tz: data.tz,
          estado: data.estado,
        });

        this.bloquesPlano = data.bloques ?? [];
        this.resetBloquesForm(this.groupByHoras(this.bloquesPlano));

        this.pageMeta.replace({
          titulo: `Horario: ${data.nombre}`,
          ruta: ['/horario'],
        });

        this.form.disable();
        this.isEditing = false;
      },
      error: () => {
        // Interceptor maneja errores
      },
    });
  }

  ngOnDestroy() {
    this.pageMeta.clear();
  }

  onEdit(ev: Event): void {
    ev.stopPropagation();
    this.isEditing = true;
    this.open = true;
    this.form.enable();
  }

  async onCancel(): Promise<void> {
    const raw = this.form.getRawValue();

    const headerChanged =
      (raw.nombre ?? '') !== this.originalData.nombre ||
      (raw.tz ?? '') !== this.originalData.tz ||
      (raw.estado ?? 1) !== this.originalData.estado;

    const currentBloques = this.normalizeBloquesForCompare(
      (raw.bloques ?? []).map((b): VMHorarioBloqueForm => ({
        dias: (b.dias ?? []) as DiaSemana[],
        horaInicio: (b.horaInicio ?? '').trim(),
        horaFin: (b.horaFin ?? '').trim(),
      })),
    );

    const originalGrouped = this.normalizeBloquesForCompare(
      this.groupByHoras(this.originalData.bloques ?? []),
    );

    const blocksChanged =
      JSON.stringify(currentBloques) !== JSON.stringify(originalGrouped);

    if (headerChanged || blocksChanged) {
      const ok = await this.notify.confirm({
        variant: 'warning',
        title: 'Descartar cambios',
        message: 'Hay cambios sin guardar. ¿Deseas descartarlos?',
        confirmText: 'Descartar',
        cancelText: 'Seguir editando',
      });
      if (!ok) return;
    }

    this.form.patchValue({
      nombre: this.originalData.nombre,
      tz: this.originalData.tz,
      estado: this.originalData.estado,
    });

    this.bloquesPlano = this.originalData.bloques ?? [];
    this.resetBloquesForm(this.groupByHoras(this.bloquesPlano));

    this.form.disable();
    this.isEditing = false;
  }

  async onSave(): Promise<void> {
    if (this.submitting) return;

    const raw = this.form.getRawValue();
    const nombre = (raw.nombre ?? '').trim();
    const tz = (raw.tz ?? '').trim();
    const estado = Number(raw.estado ?? this.originalData.estado);

    if (!nombre) {
      await this.notify.ok({
        variant: 'warning',
        title: 'Datos incompletos',
        message: 'Debe ingresar un nombre válido.',
        primaryText: 'Aceptar',
      });
      return;
    }

    const bloquesVm: VMHorarioBloqueForm[] = (raw.bloques ?? []).map((b) => ({
      dias: (b.dias ?? []) as DiaSemana[],
      horaInicio: (b.horaInicio ?? '').trim(),
      horaFin: (b.horaFin ?? '').trim(),
    }));

    const msgBloques = this.validaBloques(bloquesVm);
    if (msgBloques) {
      this.bloquesFA.controls.forEach((g) => {
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

    // Confirmación especial si marca Eliminado
    if (estado === 0 && this.originalData.estado !== 0) {
      const ok = await this.notify.confirm({
        variant: 'warning',
        title: 'Eliminar (soft delete)',
        message: 'Este horario quedará como ELIMINADO. ¿Deseas continuar?',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
      });
      if (!ok) return;
    } else {
      const ok = await this.notify.confirm({
        variant: 'info',
        title: 'Guardar cambios',
        message: '¿Deseas guardar los cambios del horario?',
        confirmText: 'Guardar',
        cancelText: 'Cancelar',
      });
      if (!ok) return;
    }

    const activos = this.bloquesActivos(bloquesVm);
    const bloquesDto: DTOHorarioBloqueCreate[] = activos.map((b) => ({
      dias: this.sortDias(b.dias),
      hora_inicio: b.horaInicio,
      hora_fin: b.horaFin,
    }));

    const cambios: Partial<{
      ho_nombre: string;
      ho_tz: string;
      ho_estado: number;
      bloques: DTOHorarioBloqueCreate[];
    }> = {
      bloques: bloquesDto, // en detalle enviamos siempre bloques para consistencia con el editor
    };

    if (nombre !== this.originalData.nombre) cambios.ho_nombre = nombre;
    if (tz !== this.originalData.tz) cambios.ho_tz = tz;
    if (estado !== this.originalData.estado) cambios.ho_estado = estado;

    // Si realmente no cambió nada, evitar request
    if (
      cambios.ho_nombre == null &&
      cambios.ho_tz == null &&
      cambios.ho_estado == null &&
      JSON.stringify(this.normalizeBloquesForCompare(bloquesVm)) ===
        JSON.stringify(this.normalizeBloquesForCompare(this.groupByHoras(this.originalData.bloques ?? [])))
    ) {
      await this.notify.ok({
        variant: 'info',
        title: 'Sin cambios',
        message: 'No hay cambios que guardar.',
        primaryText: 'Aceptar',
      });
      return;
    }

    this.submitting = true;
    try {
      const updated = await this.service.update(this.idhorario, cambios);

      await this.notify.ok({
        variant: 'success',
        title: 'Cambios guardados',
        message: 'El horario se actualizó correctamente.',
        primaryText: 'Aceptar',
      });

      // Si quedó eliminado, regresamos al listado (porque GET /horario/:id luego será 404 por su backend)
      if (updated.estado === 0) {
        this.router.navigateByUrl('/horario');
        return;
      }

      this.originalData = updated;
      this.bloquesPlano = updated.bloques ?? [];

      this.form.patchValue({
        nombre: updated.nombre,
        tz: updated.tz,
        estado: updated.estado,
      });

      this.resetBloquesForm(this.groupByHoras(this.bloquesPlano));

      this.form.disable();
      this.isEditing = false;
    } catch {
      // Error ya manejado por interceptor global
    } finally {
      this.submitting = false;
    }
  }

  // ----------------- Bloques UI -----------------

  addBloque() {
    const g: BloqueFormGroup = this.fb.group({
      dias: new FormControl<DiaSemana[]>([], { nonNullable: true }),
      horaInicio: new FormControl<string>('', { nonNullable: true }),
      horaFin: new FormControl<string>('', { nonNullable: true }),
    });

    this.bloquesFA.push(g);
    this.bloquesFA.markAsDirty();
    this.bloquesFA.markAsTouched();
    this.bloquesFA.updateValueAndValidity();
  }

  removeBloque(index: number) {
    if (this.bloquesFA.length <= 1) return;
    this.bloquesFA.removeAt(index);
    this.bloquesFA.markAsDirty();
    this.bloquesFA.markAsTouched();
    this.bloquesFA.updateValueAndValidity();
  }

  onDiaChange(index: number, dia: DiaSemana, checked: boolean) {
    const bloque = this.bloquesFA.at(index);
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

  // ----------------- Transformaciones y validación -----------------

  private groupByHoras(plano: VMHorarioBloque[]): VMHorarioBloqueForm[] {
    const map = new Map<string, VMHorarioBloqueForm>();

    for (const b of plano ?? []) {
      const key = `${b.horaInicio}|${b.horaFin}`;
      const cur = map.get(key) ?? { dias: [], horaInicio: b.horaInicio, horaFin: b.horaFin };
      if (!cur.dias.includes(b.dia)) cur.dias.push(b.dia);
      map.set(key, cur);
    }

    const arr = Array.from(map.values());
    if (arr.length === 0) return [{ dias: [], horaInicio: '', horaFin: '' }];

    arr.sort((a, b) =>
      (a.horaInicio || '').localeCompare(b.horaInicio || '') ||
      (a.horaFin || '').localeCompare(b.horaFin || ''),
    );

    return arr.map((x) => ({ ...x, dias: this.sortDias(x.dias) }));
  }

  private resetBloquesForm(bloques: VMHorarioBloqueForm[]) {
    this.bloquesFA.clear();

    const list = (bloques && bloques.length) ? bloques : [{ dias: [], horaInicio: '', horaFin: '' }];

    for (const b of list) {
      const g: BloqueFormGroup = this.fb.group({
        dias: new FormControl<DiaSemana[]>(b.dias ?? [], { nonNullable: true }),
        horaInicio: new FormControl<string>(b.horaInicio ?? '', { nonNullable: true }),
        horaFin: new FormControl<string>(b.horaFin ?? '', { nonNullable: true }),
      });
      this.bloquesFA.push(g);
    }

    this.bloquesFA.markAsPristine();
    this.bloquesFA.markAsUntouched();
  }

  private sortDias(dias: DiaSemana[]): DiaSemana[] {
    return [...(dias ?? [])].sort((a, b) => (this.diaOrder[a] ?? 999) - (this.diaOrder[b] ?? 999));
  }

  private bloquesActivos(bloques: VMHorarioBloqueForm[]): VMHorarioBloqueForm[] {
    return (bloques ?? []).filter(
      (b) =>
        (b.dias && b.dias.length > 0) ||
        (b.horaInicio && b.horaInicio.trim() !== '') ||
        (b.horaFin && b.horaFin.trim() !== ''),
    );
  }

  private normalizeBloquesForCompare(bloques: VMHorarioBloqueForm[]): VMHorarioBloqueForm[] {
    const activos = this.bloquesActivos(bloques).map((b) => ({
      dias: this.sortDias(b.dias),
      horaInicio: (b.horaInicio ?? '').trim(),
      horaFin: (b.horaFin ?? '').trim(),
    }));

    activos.sort((a, b) =>
      (a.horaInicio || '').localeCompare(b.horaInicio || '') ||
      (a.horaFin || '').localeCompare(b.horaFin || ''),
    );

    return activos;
  }

  private validaBloques(bloques: VMHorarioBloqueForm[]): string | null {
    const activos = this.bloquesActivos(bloques);

    if (!activos || activos.length === 0) {
      return 'Debe definir al menos un bloque de días y horas.';
    }
    if (activos.some((b) => !b.dias || b.dias.length === 0)) {
      return 'Cada bloque debe tener al menos un día seleccionado.';
    }
    if (activos.some((b) => !b.horaInicio || !b.horaFin)) {
      return 'Cada bloque debe tener hora de inicio y hora de fin.';
    }
    if (activos.some((b) => (b.horaInicio || '') >= (b.horaFin || ''))) {
      return 'En cada bloque la hora de inicio debe ser menor que la hora de fin.';
    }

    return null;
  }
}
