import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { VMLoginCreate } from '../models/login.vm';
import { LoginService } from '../services/login.service';
import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';

@Component({
  selector: 'app-login-registrar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registrar.html',
  styleUrl: './registrar.css'
})
export class Registar {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private service = inject(LoginService);
  private notify = inject(NotificacionesService);

  submitting = false;

  form = this.fb.group<ControlsOf<VMLoginCreate>>({
    nombres: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    apellidoPaterno: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    apellidoMaterno: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    dni: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    telefono: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    correoE: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    contrasena: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  async onSubmit() {
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
    this.submitting = true;

    try {
      const vm: VMLoginCreate = this.form.getRawValue();
      await this.service.create(vm);

      // Éxito (el error lo manejará el interceptor si falla)
      await this.notify.ok({
        variant: 'success',
        title: 'Registro completado',
        message: 'Se creó el usuario correctamente.',
        primaryText: 'Ir al login'
      });

      this.router.navigate(['/login']);
    } catch {
      // Nada aquí: el interceptor ya mostró el diálogo de error
    } finally {
      this.submitting = false;
    }
  }

  onBack() {
    this.router.navigateByUrl('/login');
  }
}

type ControlsOf<T> = {
  [K in keyof T]: FormControl<T[K]>;
};
