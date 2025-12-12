import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormControl
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { VMCuentaCreate } from '../models/cuenta.vm';
import { CuentaService } from '../services/cuenta.service';
import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';

@Component({
  selector: 'app-cuenta-registrar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registrar.html',
  styleUrl: './registrar.css'
})
export class Registar implements OnInit {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private service = inject(CuentaService);
  private notify = inject(NotificacionesService);
  private route = inject(ActivatedRoute);

  submitting = false;

  /** 'public' = registro desde login; 'admin' = registro desde panel */
  mode: 'public' | 'admin' = 'public';

  get isPublicMode(): boolean {
    return this.mode === 'public';
  }

  get isAdminMode(): boolean {
    return this.mode === 'admin';
  }

  form = this.fb.group<ControlsOf<VMCuentaCreate>>({
    nombres: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    apellidoPaterno: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    apellidoMaterno: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    dni: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    telefono: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    correoE: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    contrasena: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  ngOnInit(): void {
    const modeData = this.route.snapshot.data['mode'];
    if (modeData === 'admin') {
      this.mode = 'admin';
    } else {
      this.mode = 'public';
    }
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

    this.submitting = true;

    try {
      const vm: VMCuentaCreate = this.form.getRawValue();

      // El servicio ya devuelve el ID creado
      const createdId = await this.service.create(vm);

      if (this.isPublicMode) {
        // === Comportamiento actual de pantalla de login ===
        await this.notify.ok({
          variant: 'success',
          title: 'Registro completado',
          message: 'Se creó el usuario correctamente.',
          primaryText: 'Ir al login',
        });
        this.router.navigate(['/login']);
      } else {
        // === Comportamiento tipo "ciudadano registrar" para admin/supervisor ===
        await this.notify.ok({
          variant: 'success',
          title: 'Usuario creado',
          message: 'El usuario se creó correctamente.',
          primaryText: 'Ver ficha',
        });
        // Redirige al detalle de usuario (ajusta ruta si es distinta)
        this.router.navigate(['/admin/usuario', createdId]);
      }

    } catch {
      // El interceptor global gestionará el error
    } finally {
      this.submitting = false;
    }
  }

  onBack() {
    if (this.isPublicMode) {
      this.router.navigateByUrl('/login');
    } else {
      // Comportamiento similar a ciudadano: regresar al listado de usuarios
      this.router.navigateByUrl('/admin/usuario/lista');
    }
  }
}

type ControlsOf<T> = {
  [K in keyof T]: FormControl<T[K]>;
};
