// src/app/pages/proceso/proceso.detalle/proceso.detalle.ts

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ProcesoService } from '../services/proceso.service';
import { VMProcesoDetalleSimple, VMProcesoUpdate } from '../models/proceso.vm';

import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';
import { PageMetaService } from '@/app/services/page_meta.service';

@Component({
  selector: 'app-proceso-detalle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './proceso.detalle.html',
  styleUrl: './proceso.detalle.css',
})
export class ProcesoDetalle implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private service = inject(ProcesoService);
  private notify = inject(NotificacionesService);
  private pageMeta = inject(PageMetaService);

  idproceso = 0;
  data: VMProcesoDetalleSimple | null = null;

  open = true;
  isEditing = false;
  submittedEdit = false;
  submitting = false;
  assigning = false;

  originalFormData!: ProcesoDetalleForm;

  creadoPorNombre: string | null = null;
  creadoPorDni: string | null = null;
  fechaCreadoPor: Date | string | null = null;

  modificadoPorNombre: string | null = null;
  modificadoPorDni: string | null = null;
  fechaModificadoPor: Date | string | null = null;

  estadoPorNombre: string | null = null;
  estadoPorDni: string | null = null;
  fechaEstadoPor: Date | string | null = null;

  form = this.fb.group<ControlsOf<ProcesoDetalleForm>>({
    dni: new FormControl('', { nonNullable: true }),
    asesorInicialNombre: new FormControl('', { nonNullable: true }),
    asesorActualNombre: new FormControl('', { nonNullable: true }),

    fechaRegistrada: new FormControl('', { nonNullable: true }),
    numeroExpediente: new FormControl('', { nonNullable: true, validators: [Validators.required,Validators.maxLength(50)] }),
    sede: new FormControl('', { nonNullable: true, validators: [Validators.required,Validators.maxLength(100)] }),
    parte: new FormControl('', { nonNullable: true, validators: [Validators.required,Validators.maxLength(150)] }),
    materia: new FormControl('', { nonNullable: true, validators: [Validators.required,Validators.maxLength(150)] }),
    demandante: new FormControl('', { nonNullable: true }),
    demandado: new FormControl('', { nonNullable: true, validators: [Validators.required,Validators.maxLength(150)] }),
    estadoProcesal: new FormControl('', { nonNullable: true, validators: [Validators.required,Validators.maxLength(80)] }),
    observacion: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(600)] }),
  });

  ngOnInit(): void {
    this.form.disable();

    const id = Number(
      this.route.snapshot.paramMap.get('idproceso') ??
      this.route.snapshot.paramMap.get('id')
    );

    if (!id || isNaN(id)) return;

    this.idproceso = id;

    this.pageMeta.replace({
      titulo: 'Proceso:',
      ruta: ['/proceso'],
    });

    this.load();
  }

  ngOnDestroy(): void {
    this.pageMeta.clear();
  }

  private load(): void {
    this.service.getById(this.idproceso).subscribe({
      next: (data) => {
        this.aplicarDetalle(data);

        this.service.getControlById(this.idproceso).subscribe({
          next: (control) => this.aplicarControl(control),
          error: () => {
            // Si no carga auditoría, no bloquea el detalle.
          },
        });
      },
      error: () => {
        // El interceptor ya mostró el diálogo.
      },
    });
  }

  private aplicarDetalle(data: VMProcesoDetalleSimple): void {
    const detalle = data as VMProcesoDetalleSimple & {
      fechaRegistrada?: string | null;
    };

    const formData: ProcesoDetalleForm = {
      dni: data.dni ?? '—',
      asesorInicialNombre: data.asesorInicialNombre ?? '—',
      asesorActualNombre: data.asesorActualNombre ?? '—',

      fechaRegistrada: detalle.fechaRegistrada ?? '',
      numeroExpediente: data.numeroExpediente ?? '',
      sede: data.sede ?? '',
      parte: data.parte ?? '',
      materia: data.materia ?? '',
      demandante: data.demandante ?? '',
      demandado: data.demandado ?? '',
      estadoProcesal: data.estadoProcesal ?? '',
      observacion: data.observacion ?? '',
    };

    this.data = data;
    this.originalFormData = { ...formData };

    this.form.reset(formData);
    this.form.disable();

    this.isEditing = false;
    this.submittedEdit = false;

    this.form.markAsPristine();
    this.form.markAsUntouched();

    this.pageMeta.set({
      titulo: `Proceso Nº${data.id} - Consulta Nº${data.idconsulta} - Expediente: ${data.numeroExpediente || '-'}`,
    });
  }

  private aplicarControl(control: ProcesoControlData): void {
    this.creadoPorNombre = control.creadoPorNombre ?? null;
    this.creadoPorDni = control.creadoPorDni ?? null;
    this.fechaCreadoPor = control.fechaCreadoPor ?? null;

    this.modificadoPorNombre = control.modificadoPorNombre ?? null;
    this.modificadoPorDni = control.modificadoPorDni ?? null;
    this.fechaModificadoPor = control.fechaModificadoPor ?? null;

    this.estadoPorNombre = control.estadoPorNombre ?? null;
    this.estadoPorDni = control.estadoPorDni ?? null;
    this.fechaEstadoPor = control.fechaEstadoPor ?? null;
  }

  onEdit(event: Event): void {
    event.stopPropagation();

    if (this.isEditing) return;

    this.submittedEdit = false;
    this.isEditing = true;
    this.open = true;

    this.form.enable();

    this.form.controls.dni.disable({ emitEvent: false });
    this.form.controls.asesorInicialNombre.disable({ emitEvent: false });
    this.form.controls.asesorActualNombre.disable({ emitEvent: false });
    this.form.controls.demandante.disable({ emitEvent: false });

    this.form.updateValueAndValidity({ emitEvent: false });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  async onAsignarmeAsesor(event: Event): Promise<void> {
    event.stopPropagation();

    if (!this.isEditing) return;

    const ok = await this.notify.confirm({
      variant: 'warning',
      title: 'Asignarme como asesor',
      message: '¿Deseas asignarte como asesor en curso de este proceso?',
      confirmText: 'Asignarme',
      cancelText: 'Cancelar',
    });

    if (!ok) return;

    this.assigning = true;

    try {
      const asesor = await this.service.asignarme(this.idproceso);

      this.form.patchValue({
        asesorActualNombre: asesor.asesorActualNombre ?? '—',
      }, { emitEvent: false });

      if (this.data) {
        this.data = {
          ...this.data,
          asesorActualId: asesor.asesorActualId,
          asesorActualNombre: asesor.asesorActualNombre,
        };
      }

      this.originalFormData = {
        ...this.originalFormData,
        asesorActualNombre: asesor.asesorActualNombre ?? '—',
      };

      this.service.getControlById(this.idproceso).subscribe({
        next: (control) => this.aplicarControl(control),
        error: () => {},
      });

      await this.notify.ok({
        variant: 'success',
        title: 'Asesor asignado',
        message: 'Te asignaste correctamente como asesor en curso del proceso.',
        primaryText: 'Aceptar',
      });
    } catch {
      // El interceptor ya mostró el error.
    } finally {
      this.assigning = false;
    }
  }

  async onCancel(): Promise<void> {
    if (this.hasUnsavedChanges()) {
      const ok = await this.notify.confirm({
        variant: 'warning',
        title: 'Descartar cambios',
        message: 'Tienes cambios sin guardar. ¿Deseas descartarlos?',
        confirmText: 'Descartar',
        cancelText: 'Seguir editando',
      });

      if (!ok) return;
    }

    this.form.reset(this.originalFormData);

    this.isEditing = false;
    this.submittedEdit = false;

    this.form.disable();
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  async onSave(): Promise<void> {
    this.submittedEdit = true;

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
    
    if (!this.isEditing) return;
    
    this.submittedEdit = true;
    this.normalizarFormulario();
    
    this.form.updateValueAndValidity({ emitEvent: false });

    if (this.form.invalid) {
      this.form.markAllAsTouched();

      await this.notify.ok({
        variant: 'warning',
        title: 'Datos inválidos',
        message: 'Revisa la longitud de los campos e inténtalo nuevamente.',
        primaryText: 'Aceptar',
      });

      return;
    }

    const raw = this.form.getRawValue();

    const currentForm: ProcesoDetalleForm = {
      dni: raw.dni,
      asesorInicialNombre: raw.asesorInicialNombre,
      asesorActualNombre: raw.asesorActualNombre,
      fechaRegistrada: raw.fechaRegistrada,
      numeroExpediente: raw.numeroExpediente,
      sede: raw.sede,
      parte: raw.parte,
      materia: raw.materia,
      demandante: raw.demandante,
      demandado: raw.demandado,
      estadoProcesal: raw.estadoProcesal,
      observacion: raw.observacion,
    };

    const changes: Partial<VMProcesoUpdate> & {
      fechaRegistrada?: string | null;
    } = {};

    if (currentForm.fechaRegistrada !== this.originalFormData.fechaRegistrada) {
      changes.fechaRegistrada = currentForm.fechaRegistrada || null;
    }

    if (currentForm.numeroExpediente !== this.originalFormData.numeroExpediente) {
      changes.numeroExpediente = currentForm.numeroExpediente;
    }

    if (currentForm.sede !== this.originalFormData.sede) {
      changes.sede = currentForm.sede;
    }

    if (currentForm.parte !== this.originalFormData.parte) {
      changes.parte = currentForm.parte;
    }

    if (currentForm.materia !== this.originalFormData.materia) {
      changes.materia = currentForm.materia;
    }

    if (currentForm.demandado !== this.originalFormData.demandado) {
      changes.demandado = currentForm.demandado;
    }

    if (currentForm.estadoProcesal !== this.originalFormData.estadoProcesal) {
      changes.estadoProcesal = currentForm.estadoProcesal;
    }

    if (currentForm.observacion !== this.originalFormData.observacion) {
      changes.observacion = currentForm.observacion;
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
      message: '¿Deseas guardar los cambios realizados?',
      confirmText: 'Guardar',
      cancelText: 'Cancelar',
    });

    if (!confirm) return;

    if (!this.idproceso || isNaN(this.idproceso)) {
      await this.notify.ok({
        variant: 'error',
        title: 'Operación inválida',
        message: 'No se encontró el ID del proceso.',
        primaryText: 'Aceptar',
      });

      return;
    }

    this.submitting = true;

    try {
      await this.service.update(this.idproceso, changes);

      const detalle = await firstValueFrom(this.service.getById(this.idproceso));
      this.aplicarDetalle(detalle);

      this.service.getControlById(this.idproceso).subscribe({
        next: (control) => this.aplicarControl(control),
        error: () => {},
      });

      await this.notify.ok({
        variant: 'success',
        title: 'Cambios guardados',
        message: 'La información del proceso se actualizó correctamente.',
        primaryText: 'Aceptar',
      });

      this.isEditing = false;
      this.submittedEdit = false;
      this.form.disable();
    } catch {
      // El interceptor ya mostró el error.
    } finally {
      this.submitting = false;
    }
  }

  private hasUnsavedChanges(): boolean {
    if (!this.originalFormData) return false;

    const v = this.form.getRawValue() as Record<string, unknown>;
    const o = this.originalFormData as Record<string, unknown>;

    const editableFields: Array<keyof ProcesoDetalleForm> = [
      'fechaRegistrada',
      'numeroExpediente',
      'sede',
      'parte',
      'materia',
      'demandado',
      'estadoProcesal',
      'observacion',
    ];

    for (const k of editableFields) {
      if (v[k] !== o[k]) return true;
    }

    return false;
  }

  private normalizarFormulario(): void {
    const v = this.form.getRawValue();

    this.form.patchValue({
      numeroExpediente: this.clean(v.numeroExpediente),
      sede: this.clean(v.sede),
      parte: this.clean(v.parte),
      materia: this.clean(v.materia),
      demandado: this.clean(v.demandado),
      estadoProcesal: this.clean(v.estadoProcesal),
      observacion: this.clean(v.observacion),
    }, { emitEvent: false });
  }

  private clean(value: unknown): string {
    return String(value ?? '').trim();
  }
}

type ProcesoDetalleForm = {
  dni: string;
  asesorInicialNombre: string;
  asesorActualNombre: string;

  fechaRegistrada: string;
  numeroExpediente: string;
  sede: string;
  parte: string;
  materia: string;
  demandante: string;
  demandado: string;
  estadoProcesal: string;
  observacion: string;
};

type ProcesoControlData = {
  creadoPorNombre?: string | null;
  creadoPorDni?: string | null;
  fechaCreadoPor?: Date | string | null;

  modificadoPorNombre?: string | null;
  modificadoPorDni?: string | null;
  fechaModificadoPor?: Date | string | null;

  estadoPorNombre?: string | null;
  estadoPorDni?: string | null;
  fechaEstadoPor?: Date | string | null;
};

type ControlsOf<T> = {
  [K in keyof T]: FormControl<T[K]>;
};