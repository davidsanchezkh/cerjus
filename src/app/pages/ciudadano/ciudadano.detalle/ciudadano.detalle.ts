import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';

import { VMCiudadanoDetalleSimple, VMCiudadanoUpdate, VMCiudadanoUpdateForm } from '../models/ciudadano.vm';
import { CiudadanoService } from '../services/ciudadano.service';
import { MapDetalleToUpdate } from '../mappers/ciudadano.mapper';
import { ConsultaListaCiudadano } from '../../consulta/consulta.lista.ciudadano/consulta.lista.ciudadano';

// Notificaciones (OK/Confirm/Loading ya están centralizados)
import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';

@Component({
  selector: 'app-ciudadano-detalle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConsultaListaCiudadano],
  templateUrl: './ciudadano.detalle.html',
  styleUrl: './ciudadano.detalle.css'
})
export class CiudadanoDetalle implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(CiudadanoService);
  private fb = inject(FormBuilder);
  private notify = inject(NotificacionesService);

  idciudadano!: number;
  isEditing = false;

  // controla el colapso del panel (ajusta a tu UI real)
  open = false;
  open2 = true;

  originalData!: VMCiudadanoUpdate;

  form = this.fb.group<ControlsOf<VMCiudadanoUpdateForm>>({
    nombres: new FormControl('', { nonNullable: true }),
    apellidoPaterno: new FormControl('', { nonNullable: true }),
    apellidoMaterno: new FormControl('', { nonNullable: true }),
    dni: new FormControl('', { nonNullable: true }),
    domicilio: new FormControl('', { nonNullable: true }),
    ocupacion: new FormControl('', { nonNullable: true }),
    fechaNacimiento: new FormControl('', { nonNullable: true }),
    hijos: new FormControl(0, { nonNullable: true }),
    telefono: new FormControl('', { nonNullable: true }),
    correoE: new FormControl('', { nonNullable: true }),
    conocio: new FormControl('', { nonNullable: true }),
  });

  ngOnInit(): void {
    this.form.disable();

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.service.getById(id).subscribe({
      next: (data: VMCiudadanoDetalleSimple) => {
        this.form.patchValue(data);
        this.originalData = MapDetalleToUpdate(data);
        this.idciudadano = id;
      },
      error: () => {
        // El interceptor ya mostró el diálogo (404, etc.).
        // Opcional: podrías redirigir tras el OK del interceptor si quieres.
      }
    });
  }

  // === Edición ===
  onEdit(ev: Event): void {
    ev.stopPropagation();
    this.isEditing = true;
    this.open = true;
    this.form.enable();
  }

  async onCancel(): Promise<void> {
    // Si hay cambios sin guardar, pedimos confirmación
    if (this.hasUnsavedChanges()) {
      const ok = await this.notify.confirm({
        variant: 'warning',
        title: 'Descartar cambios',
        message: 'Tienes cambios sin guardar. ¿Deseas descartarlos?',
        confirmText: 'Descartar',
        cancelText: 'Seguir editando'
      });
      if (!ok) return;
    }
    this.form.reset(this.originalData);
    this.isEditing = false;
    this.form.disable();
  }

  // === Guardado ===
  async onSave(): Promise<void> {
    if (!this.form.valid) return;

    // Calcula cambios respecto a originalData
    const current = this.form.value;
    const changes: Partial<typeof current> = {};
    for (const key of Object.keys(current) as (keyof typeof current)[]) {
      if (current[key] !== this.originalData[key]) {
        changes[key] = current[key] as any;
      }
    }

    if (Object.keys(changes).length === 0) {
      await this.notify.ok({
        variant: 'info',
        title: 'Sin cambios',
        message: 'No hay cambios para guardar.',
        primaryText: 'Aceptar'
      });
      return;
    }

    // Confirmar guardado
    const confirm = await this.notify.confirm({
      variant: 'info',
      title: 'Guardar cambios',
      message: '¿Deseas guardar los cambios realizados?',
      confirmText: 'Guardar',
      cancelText: 'Cancelar'
    });
    if (!confirm) return;

    // Asegurar id
    const id = this.originalData.id;
    if (id == null) {
      // Caso anómalo
      await this.notify.ok({
        variant: 'error',
        title: 'Operación inválida',
        message: 'No se encontró el ID del ciudadano.',
        primaryText: 'Aceptar'
      });
      return;
    }

    // Guardar (errores los maneja el interceptor con title/message backend)
    try {
      await this.service.update(id, changes as any);

      // Normalizar mayúsculas en cambios string
      const normalizedChanges = Object.fromEntries(
        Object.entries(changes).map(([k, v]) => [k, typeof v === 'string' ? v.toUpperCase() : v])
      );

      // Actualizar original + form
      this.originalData = { ...this.originalData, ...(normalizedChanges as any) };
      this.form.patchValue(this.originalData);

      // Éxito
      await this.notify.ok({
        variant: 'success',
        title: 'Cambios guardados',
        message: 'La información del ciudadano se actualizó correctamente.',
        primaryText: 'Aceptar'
      });

      this.isEditing = false;
      this.form.disable();
    } catch {
      // No hacer nada aquí; el interceptor ya mostró el diálogo de error.
    }
  }

  gotoConsulta(): void {
    this.router.navigate(['/consulta/registrar', this.idciudadano]);
  }

  // === Utilidades ===
  private hasUnsavedChanges(): boolean {
    const v = this.form.value as Record<string, unknown>;
    const o = this.originalData as Record<string, unknown>;
    for (const k of Object.keys(v)) {
      if (v[k] !== o[k]) return true;
    }
    return false;
  }
}

type ControlsOf<T> = {
  [K in keyof T]: FormControl<T[K]>;
};
