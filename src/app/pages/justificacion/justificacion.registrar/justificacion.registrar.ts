import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormControl,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';

import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';
import { JustificacionService } from '../services/justificacion.service';

import { VMAsistenciaJustificacionCreate } from '../models/justificacion.vm';
import { ASISTENCIA_JUSTIFICACION_TIPO_OPCIONES, AsistenciaJustificacionTipo, tipoHelpText } from '../models/justificacion.dominio';

const noInicialTipo: ValidatorFn = (c: AbstractControl) => (c.value === '' ? { placeholder: true } : null);

@Component({
  selector: 'app-justificacion-registrar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './justificacion.registrar.html',
  styleUrl: './justificacion.registrar.css',
})
export class JustificacionRegistrar {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private service = inject(JustificacionService);
  private notify = inject(NotificacionesService);

  readonly tipoOpciones = ASISTENCIA_JUSTIFICACION_TIPO_OPCIONES;

  submitting = false;

  form = this.fb.group<ControlsOf<VMAsistenciaJustificacionCreate>>({
    fecha_ymd: new FormControl(this.todayYmdPeru(), { nonNullable: true, validators: [Validators.required] }),
    tipo: new FormControl<AsistenciaJustificacionTipo>('', { nonNullable: true, validators: [Validators.required, noInicialTipo] }),
    motivo: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(120)] }),
    detalle: new FormControl('', { nonNullable: true }),
  });

  get tipoHelp(): string {
    return tipoHelpText(this.form.get('tipo')!.value);
  }

  private todayYmdPeru(): string {
    const dt = new Date();
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Lima',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    // en-CA => YYYY-MM-DD
    return fmt.format(dt);
  }

  private isFuture(ymd: string): boolean {
    const today = this.todayYmdPeru();
    return (ymd ?? '') > today; // compare lexicográfico funciona en YYYY-MM-DD
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      await this.notify.ok({
        variant: 'warning',
        title: 'Datos incompletos',
        message: 'Revisa los campos obligatorios e inténtalo nuevamente.',
        primaryText: 'Aceptar',
      });
      return;
    }

    const vm = this.form.getRawValue();

    // Regla local mínima: no permitir futuro (backend también valida)
    if (this.isFuture(vm.fecha_ymd)) {
      await this.notify.ok({
        variant: 'warning',
        title: 'Fecha inválida',
        message: 'No se puede justificar una fecha futura.',
        primaryText: 'Aceptar',
      });
      return;
    }

    this.submitting = true;

    try {
      const id = await this.service.create(vm);

      await this.notify.ok({
        variant: 'success',
        title: 'Solicitud registrada',
        message: `La justificación fue enviada correctamente (ID: ${id}). Queda pendiente de revisión.`,
        primaryText: 'Aceptar',
      });

      // Navegación sugerida: a “Mis justificaciones” (si aún no existe, cambie al destino que prefiera)
      this.router.navigate(['/justificacion/mis']);
    } catch {
      // Interceptor ya muestra el error del backend (title/message)
    } finally {
      this.submitting = false;
    }
  }

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
    // Si prefiere, reemplazar por una ruta fija
    this.router.navigate(['/justificacion/mis']);
  }
}

type ControlsOf<T> = {
  [K in keyof T]: FormControl<T[K]>;
};
