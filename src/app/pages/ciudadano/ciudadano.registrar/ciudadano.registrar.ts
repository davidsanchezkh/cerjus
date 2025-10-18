import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder,Validators, FormControl} from '@angular/forms';
import { Router } from '@angular/router';

import { VMCiudadanoCreate } from '../models/ciudadano.vm';
import { CiudadanoService } from '../services/ciudadano.service';

// Notificaciones centralizadas
import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';

type Supo = 'AMIGO' | 'VECINO' | 'VOLANTE' | 'OTROS' | 'ERROR';

@Component({
  selector: 'app-ciudadano-registrar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ciudadano.registrar.html',
  styleUrl: './ciudadano.registrar.css'
})
export class CiudadanoRegistar {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private service = inject(CiudadanoService);
  private notify = inject(NotificacionesService);

  form = this.fb.group<ControlsOf<VMCiudadanoCreate>>({
    nombres: new FormControl('', { nonNullable: true, validators: [Validators.required]}),
    apellidoPaterno: new FormControl('', { nonNullable: true, validators: [Validators.required]}),
    apellidoMaterno: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    dni: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    domicilio: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    ocupacion: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    fechaNacimiento: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    hijos: new FormControl(0, { nonNullable: true, validators: [Validators.required] }),
    telefono: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    correoE: new FormControl('', { nonNullable: true }),

    supo: new FormControl<Supo>('ERROR', { nonNullable: true, validators: [Validators.required] }),
    supoOtrosDetalle: new FormControl('', { nonNullable: true })
  });

  submitting = false;
  /** Guard en cliente para un caso de negocio simple */
  private validaSupo(): string | null {
    const v = this.form.value;
    if (v.supo === 'OTROS' && !v.supoOtrosDetalle?.trim()) {
      return 'Indique cómo conoció el servicio en “Otros”.';
    }
    return null;
  }

  async onSubmit() {
    // 1) Validación de form en cliente (evita mandar basura y mostrar 400)
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      await this.notify.ok({
        variant: 'warning',
        title: 'Datos incompletos',
        message: 'Revisa los campos obligatorios e inténtalo nuevamente.',
        primaryText: 'Aceptar'
      });
      return;
    }

    // 2) Regla de negocio local (opcional)
    const msgSupo = this.validaSupo();
    if (msgSupo) {
      await this.notify.ok({
        variant: 'warning',
        title: 'Falta información',
        message: msgSupo,
        primaryText: 'Aceptar'
      });
      return;
    }

    this.submitting = true;

    try {
      // 3) Envío (timeouts/red/5xx/400 server → los maneja el interceptor con title/message)
      const vm: VMCiudadanoCreate = this.form.getRawValue();
      const createdId = await this.service.create(vm);

      // 4) Éxito: diálogo OK bloqueante + navegación
      await this.notify.ok({
        variant: 'success',
        title: 'Registro completado',
        message: 'El ciudadano se creó correctamente.',
        primaryText: 'Ver ficha'
      });

      this.router.navigate(['/ciudadano', createdId]);
    } catch {
      // Nada aquí: el interceptor ya mostró el diálogo de error adecuado
    } finally {
      this.submitting = false;
    }
  }

  /** Volver: si hay cambios, confirmamos descarte */
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
    this.router.navigateByUrl('/ciudadano');
  }
}

type ControlsOf<T> = {
  [K in keyof T]: FormControl<T[K]>;
};