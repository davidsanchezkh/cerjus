import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormControl,
  Validators,
  AbstractControl,
  ValidationErrors,
  FormGroup,
} from '@angular/forms';

import { CuentaService } from '../services/cuenta.service';
import { VMCuentaPerfil, VMCuentaPerfilUpdateForm } from '../models/cuenta.vm';
import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';
import { PageMetaService } from '@/app/services/page_meta.service';

@Component({
  selector: 'app-cuenta-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit, OnDestroy {

  private fb = inject(FormBuilder);
  private cuentaService = inject(CuentaService);
  private notify = inject(NotificacionesService);
  private pageMeta = inject(PageMetaService);

  perfil?: VMCuentaPerfil;

  openPerfil = true;
  openPassword = true;

  isEditingPerfil = false;
  submittedPerfil = false;

  // Para restaurar valores originales
  originalPerfil?: VMCuentaPerfil;

  formPerfil = this.fb.group<ControlsOf<CuentaPerfilForm>>({
    nombres: new FormControl('', { nonNullable: true }),
    apellidoPaterno: new FormControl('', { nonNullable: true }),
    apellidoMaterno: new FormControl('', { nonNullable: true }),
    dni: new FormControl('', { nonNullable: true }),
    correoE: new FormControl('', { nonNullable: true }),
    telefono: new FormControl('', { nonNullable: true }),
    tz: new FormControl('', { nonNullable: true }),
    fechaCreadoPorTexto: new FormControl('', { nonNullable: true }),
  });

  formPassword: FormGroup = this.fb.group(
    {
      actual: ['', [Validators.required]],
      nueva: ['', [Validators.required, Validators.minLength(6)]],
      nuevaConfirm: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator }
  );

  constructor() {}

  ngOnInit(): void {
    // Título de la página
    this.pageMeta.replace({
      titulo: 'Mi perfil',
    });

    this.cuentaService.getMiPerfil().subscribe({
      next: (p) => {
        this.perfil = p;
        this.originalPerfil = { ...p };

        const fechaTxt = formatDateTime(p.fechaCreadoPor);

        this.formPerfil.patchValue({
          nombres: p.nombres,
          apellidoPaterno: p.apellidoPaterno,
          apellidoMaterno: p.apellidoMaterno,
          dni: p.dni,
          correoE: p.correoE,
          telefono: p.telefono,
          tz: p.tz,
          fechaCreadoPorTexto: fechaTxt,
        });
      },
      error: () => {
        // El interceptor global debería manejar el error (401, 404, etc.)
      },
    });
  }

  ngOnDestroy(): void {
    this.pageMeta.clear();
  }

  // ===== PERFIL =====
  onEditPerfil(ev: Event): void {
    ev.stopPropagation();
    this.isEditingPerfil = !this.isEditingPerfil;
    this.submittedPerfil = false;

    if (!this.isEditingPerfil && this.originalPerfil) {
      this.resetPerfilForm(this.originalPerfil);
    }
  }

  async onCancelPerfil(): Promise<void> {
    if (this.hasUnsavedPerfilChanges()) {
      const ok = await this.notify.confirm({
        variant: 'warning',
        title: 'Descartar cambios',
        message: 'Tienes cambios sin guardar. ¿Deseas descartarlos?',
        confirmText: 'Descartar',
        cancelText: 'Seguir editando',
      });
      if (!ok) return;
    }

    if (this.originalPerfil) {
      this.resetPerfilForm(this.originalPerfil);
    }

    this.isEditingPerfil = false;
    this.submittedPerfil = false;
  }

  private resetPerfilForm(p: VMCuentaPerfil): void {
    const fechaTxt = formatDateTime(p.fechaCreadoPor);
    this.formPerfil.patchValue({
      nombres: p.nombres,
      apellidoPaterno: p.apellidoPaterno,
      apellidoMaterno: p.apellidoMaterno,
      dni: p.dni,
      correoE: p.correoE,
      telefono: p.telefono,
      tz: p.tz,
      fechaCreadoPorTexto: fechaTxt,
    });
  }

  async onSavePerfil(): Promise<void> {
    this.submittedPerfil = true;

    if (!this.perfil) return;

    const v = this.formPerfil.value;

    const changes: VMCuentaPerfilUpdateForm = {};

    if (v.nombres !== this.originalPerfil?.nombres) {
      changes.nombres = v.nombres ?? '';
    }
    if (v.apellidoPaterno !== this.originalPerfil?.apellidoPaterno) {
      changes.apellidoPaterno = v.apellidoPaterno ?? '';
    }
    if (v.apellidoMaterno !== this.originalPerfil?.apellidoMaterno) {
      changes.apellidoMaterno = v.apellidoMaterno ?? '';
    }
    if (v.dni !== this.originalPerfil?.dni) {
      changes.dni = v.dni ?? '';
    }
    if (v.correoE !== this.originalPerfil?.correoE) {
      changes.correoE = v.correoE ?? '';
    }
    if (v.telefono !== this.originalPerfil?.telefono) {
      changes.telefono = v.telefono ?? '';
    }
    if (v.tz !== this.originalPerfil?.tz) {
      changes.tz = v.tz ?? '';
    }

    if (Object.keys(changes).length === 0) {
      await this.notify.ok({
        variant: 'info',
        title: 'Sin cambios',
        message: 'No hay cambios para guardar.',
        primaryText: 'Aceptar',
      });
      return;
    }

    const confirm = await this.notify.confirm({
      variant: 'info',
      title: 'Guardar cambios',
      message: '¿Deseas guardar los cambios de tu perfil?',
      confirmText: 'Guardar',
      cancelText: 'Cancelar',
    });
    if (!confirm) return;

    try {
      await this.cuentaService.updateMiPerfil(changes);

      // Actualizar modelo local
      if (this.perfil) {
        this.perfil = { ...this.perfil, ...changes };
        this.originalPerfil = { ...this.perfil };
        this.resetPerfilForm(this.perfil);
      }

      await this.notify.ok({
        variant: 'success',
        title: 'Perfil actualizado',
        message: 'Tu perfil se actualizó correctamente.',
        primaryText: 'Aceptar',
      });

      this.isEditingPerfil = false;
      this.submittedPerfil = false;
    } catch {
      // El interceptor global mostrará los errores HTTP.
    }
  }

  private hasUnsavedPerfilChanges(): boolean {
    if (!this.originalPerfil) return false;
    const v = this.formPerfil.value;

    if (v.nombres !== this.originalPerfil.nombres) return true;
    if (v.apellidoPaterno !== this.originalPerfil.apellidoPaterno) return true;
    if (v.apellidoMaterno !== this.originalPerfil.apellidoMaterno) return true;
    if (v.dni !== this.originalPerfil.dni) return true;
    if (v.correoE !== this.originalPerfil.correoE) return true;
    if (v.telefono !== this.originalPerfil.telefono) return true;
    if (v.tz !== this.originalPerfil.tz) return true;

    return false;
  }

  // ===== CONTRASEÑA =====
  get passwordMismatch(): boolean {
    return !!(
        this.formPassword.hasError('passwordMismatch') &&
        (this.formPassword.get('nuevaConfirm')?.touched ||
        this.formPassword.get('nuevaConfirm')?.dirty)
    );
    }

  async onChangePassword(): Promise<void> {
    if (this.formPassword.invalid) {
      this.formPassword.markAllAsTouched();
      if (this.formPassword.hasError('passwordMismatch')) {
        await this.notify.ok({
          variant: 'error',
          title: 'Contraseña no válida',
          message: 'Las nuevas contraseñas no coinciden.',
          primaryText: 'Aceptar',
        });
      }
      return;
    }

    const actual = this.formPassword.value.actual ?? '';
    const nueva = this.formPassword.value.nueva ?? '';
    const nuevaConfirm = this.formPassword.value.nuevaConfirm ?? '';

    if (nueva !== nuevaConfirm) {
      await this.notify.ok({
        variant: 'error',
        title: 'Contraseña no válida',
        message: 'Las nuevas contraseñas no coinciden.',
        primaryText: 'Aceptar',
      });
      return;
    }

    const confirm = await this.notify.confirm({
      variant: 'info',
      title: 'Actualizar contraseña',
      message: '¿Deseas actualizar tu contraseña?',
      confirmText: 'Actualizar',
      cancelText: 'Cancelar',
    });
    if (!confirm) return;

    try {
      await this.cuentaService.changePassword(actual, nueva);

      this.formPassword.reset();
      await this.notify.ok({
        variant: 'success',
        title: 'Contraseña actualizada',
        message: 'Tu contraseña se actualizó correctamente.',
        primaryText: 'Aceptar',
      });
    } catch {
      // El interceptor global mostrará mensajes: contraseña actual incorrecta, etc.
    }
  }
}

// ==== Tipos de formulario ====

interface CuentaPerfilForm {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  dni: string;
  correoE: string;
  telefono: string;
  tz: string;
  fechaCreadoPorTexto: string;
}

type ControlsOf<T> = {
  [K in keyof T]: FormControl<T[K]>;
};

// ==== Helpers ====

function formatDateTime(dt: Date | string | null | undefined): string {
  if (!dt) return '';
  const d = dt instanceof Date ? dt : new Date(dt);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}

// Validador de coincidencia de nueva contraseña
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const nueva = control.get('nueva')?.value;
  const confirm = control.get('nuevaConfirm')?.value;
  if (nueva && confirm && nueva !== confirm) {
    return { passwordMismatch: true };
  }
  return null;
}
