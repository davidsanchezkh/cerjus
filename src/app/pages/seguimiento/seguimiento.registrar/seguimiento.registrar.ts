import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { VMSeguimientoCreate } from '../models/seguimiento.vm';
import { SeguimientoService } from '../services/seguimiento.service';

// Notificaciones centralizadas (loading/errores vía interceptor; aquí sólo éxito/guards)
import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';

@Component({
  selector: 'app-seguimiento-registrar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './seguimiento.registrar.html',
  styleUrl: './seguimiento.registrar.css'
})
export class SeguimientoRegistar {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private service = inject(SeguimientoService);
  private notify = inject(NotificacionesService);

  submitting = false;

  form = this.fb.group<ControlsOf<VMSeguimientoCreate>>({
    idconsulta: new FormControl(0, { nonNullable: true, validators: [Validators.required] }),
    cuerposeguimiento: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  ngOnInit() {
    // Pre-cargar el id de la consulta desde la ruta
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!isNaN(id) && id > 0) {
      this.form.patchValue({ idconsulta: id });
    }
  }

  /** Guard en cliente simple: ambos campos son obligatorios */
  private hasClientErrors(): boolean {
    return this.form.invalid;
  }

  async onSubmit() {
    // 1) Validación local (evita mandar “basura” y mostrar 400 del backend)
    if (this.hasClientErrors()) {
      this.form.markAllAsTouched();
      await this.notify.ok({
        variant: 'warning',
        title: 'Datos incompletos',
        message: 'Revisa los campos obligatorios e inténtalo nuevamente.',
        primaryText: 'Aceptar'
      });
      return;
    }

    this.submitting = true;

    try {
      // 2) Envío (timeouts/red/5xx/400: los maneja el interceptor con title/message del backend)
      const vm: VMSeguimientoCreate = this.form.getRawValue();
      await this.service.create(vm);

      // 3) Éxito: OK bloqueante y navegar
      await this.notify.ok({
        variant: 'success',
        title: 'Seguimiento registrado',
        message: 'El seguimiento se añadió correctamente.',
        primaryText: 'Volver a la consulta'
      });

      this.navergar();
    } catch {
      // Nada aquí: el interceptor ya mostró el diálogo de error adecuado
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
        cancelText: 'Seguir aquí'
      });
      if (!ok) return;
    }
    this.navergar();
  }

  private navergar() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!isNaN(id)) {
      this.router.navigate(['/consulta', id]); // vuelve al detalle de la consulta
    } else {
      this.router.navigate(['/seguimiento']);  // fallback
    }
  }
}

type ControlsOf<T> = {
  [K in keyof T]: FormControl<T[K]>;
};
