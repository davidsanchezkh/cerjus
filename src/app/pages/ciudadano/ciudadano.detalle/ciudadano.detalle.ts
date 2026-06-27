import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { firstValueFrom, Subscription } from 'rxjs';
import { VMCiudadanoDetalleSimple, VMCiudadanoUpdate, VMCiudadanoUpdateForm, VMCiudadanoControl } from '../models/ciudadano.vm';
import { CiudadanoService } from '../services/ciudadano.service';
import { MapDetalleToUpdate } from '../mappers/ciudadano.mapper';
import { ConsultaListaCiudadano } from '../../consulta/consulta.lista.ciudadano/consulta.lista.ciudadano';
import { Conocio, CONOCIO_CIUDADANO_OPCIONES } from '../models/ciudadano.dominio';

import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';
import { PageMetaService } from '@/app/services/page_meta.service';
import { AuthStore } from '@/app/auth/auth.store';

@Component({
  selector: 'app-ciudadano-detalle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConsultaListaCiudadano],
  templateUrl: './ciudadano.detalle.html',
  styleUrl: './ciudadano.detalle.css'
})
export class CiudadanoDetalle implements OnInit , OnDestroy{

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(CiudadanoService);
  private fb = inject(FormBuilder);
  private notify = inject(NotificacionesService);
  private auth = inject(AuthStore);
  private pageMeta = inject(PageMetaService);
  private subConocio?: Subscription;

  idciudadano!: number;
  isEditing = false;
  submittedEdit = false;
  isOtros = false;

  open = false;
  open2 = true;

  originalData!: VMCiudadanoUpdate;

  // Datos solo visuales de auditoría. No se editan.
  creadoPorNombre: string | null = null;
  creadoPorDni: string | null = null;
  fechaCreadoPor: Date | string | null = null;

  modificadoPorNombre: string | null = null;
  modificadoPorDni: string | null = null;
  fechaModificadoPor: Date | string | null = null;

  canSeeControl = false;

  readonly supoOpciones = CONOCIO_CIUDADANO_OPCIONES;

  form = this.fb.group<ControlsOf<VMCiudadanoUpdateForm>>({
    nombres: new FormControl('', {nonNullable: true,validators: [Validators.required, Validators.maxLength(50)]}),
    apellidoPaterno: new FormControl('', {nonNullable: true,validators: [Validators.required, Validators.maxLength(25)]}),
    apellidoMaterno: new FormControl('', {nonNullable: true,validators: [Validators.required, Validators.maxLength(25)]}),
    dni: new FormControl('', {nonNullable: true,validators: [Validators.required, Validators.pattern(/^\d{8,11}$/)]}),
    domicilio: new FormControl('', {nonNullable: true,validators: [Validators.required, Validators.maxLength(100)]}),
    nacionalidad: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.maxLength(50)]}),
    direccionActual: new FormControl('', {nonNullable: true,validators: [Validators.maxLength(150)]}),
    detalleDiscapacidad: new FormControl('', {nonNullable: true,validators: [Validators.maxLength(255)]}),
    ocupacion: new FormControl('', {nonNullable: true,validators: [Validators.required, Validators.maxLength(20)]}),
    fechaNacimiento: new FormControl('', {nonNullable: true,validators: [Validators.required]}),
    hijos: new FormControl(0, {nonNullable: true,validators: [Validators.required, Validators.min(0)]}),
    telefono: new FormControl('', {nonNullable: true,validators: [Validators.required, Validators.pattern(/^\d{7,11}$/)]}),
    correoE: new FormControl('', {nonNullable: true,validators: [Validators.email, Validators.maxLength(255)]}),
    fechaRegistrada: new FormControl('', {nonNullable: true}),
    conocios: new FormControl<Conocio>('', {nonNullable: true,validators: [Validators.required]}),
    conocioOtros: new FormControl('', {nonNullable: true,validators: [Validators.maxLength(30)]}),
  });

  ngOnInit(): void {
    this.form.disable();

    const level = this.auth.getLevel();
    this.canSeeControl = level != null && level <= 3;

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.idciudadano = id;

    this.pageMeta.replace({
      titulo: 'Ciudadano:',
      ruta: ['/ciudadano'],
    });

    this.subConocio = this.form.get('conocios')!.valueChanges.subscribe(() => {
      this.syncConocioOtros();
    });

    this.service.getById(id).subscribe({
      next: (data: VMCiudadanoDetalleSimple) => {
        this.aplicarDetalle(data, id);
      },
      error: () => {
        // El interceptor ya mostró el diálogo.
      }
    });

    if (this.canSeeControl) {
      this.service.getControlById(id).subscribe({
        next: (control: VMCiudadanoControl) => {
          this.aplicarControl(control);
        },
        error: () => {
          // El backend sigue protegiendo esta información.
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.subConocio?.unsubscribe();
    this.pageMeta.clear();
  }

  private aplicarDetalle(data: VMCiudadanoDetalleSimple, id: number): void {
    this.form.patchValue(data);
    this.syncConocioOtros();

    this.originalData = MapDetalleToUpdate(data);

    this.pageMeta.replace({
      titulo: `Ciudadano: ${data.apellidoPaterno ?? ''} ${data.apellidoMaterno ?? ''}, ${data.nombres ?? ''} - DNI: ${data.dni ?? ''}`,
      ruta: ['/ciudadano']
    });
  }

  private aplicarControl(control: VMCiudadanoControl): void {
    this.creadoPorNombre = control.creadoPorNombre ?? null;
    this.creadoPorDni = control.creadoPorDni ?? null;
    this.fechaCreadoPor = control.fechaCreadoPor ?? null;

    this.modificadoPorNombre = control.modificadoPorNombre ?? null;
    this.modificadoPorDni = control.modificadoPorDni ?? null;
    this.fechaModificadoPor = control.fechaModificadoPor ?? null;
  }

  private syncConocioOtros() {
    const value = this.form.get('conocios')!.value as Conocio;
    const otrosCtrl = this.form.get('conocioOtros')!;

    this.isOtros = value === 'OTROS';

    if (this.isOtros) {
      otrosCtrl.setValidators([Validators.required, Validators.maxLength(30)]);
    } else {
      otrosCtrl.clearValidators();

      if (otrosCtrl.value) {
        otrosCtrl.setValue('', { emitEvent: false });
      }

      otrosCtrl.markAsPristine();
      otrosCtrl.markAsUntouched();
    }

    otrosCtrl.updateValueAndValidity({ emitEvent: false });
  }

  private validaConocioOtros(): string | null {
    const v = this.form.value;

    if (v.conocios === 'OTROS' && !v.conocioOtros?.toString().trim()) {
      return 'Indique cómo conoció el servicio en “Otros”.';
    }

    return null;
  }

  // === Edición ===
  onEdit(ev: Event): void {
    ev.stopPropagation();

    this.submittedEdit = false;
    this.isEditing = true;
    this.open = true;

    this.form.enable();
    this.syncConocioOtros();
  }

  async onCancel(): Promise<void> {
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
    this.submittedEdit = false;
    this.syncConocioOtros();
  }

  // === Guardado ===
  async onSave(): Promise<void> {
    this.submittedEdit = true;

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

    const msgOtros = this.validaConocioOtros();
    if (msgOtros) {
      await this.notify.ok({
        variant: 'warning',
        title: 'Falta información',
        message: msgOtros,
        primaryText: 'Aceptar'
      });

      return;
    }

    // Cambios respecto a originalData
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

    const confirm = await this.notify.confirm({
      variant: 'info',
      title: 'Guardar cambios',
      message: '¿Deseas guardar los cambios realizados?',
      confirmText: 'Guardar',
      cancelText: 'Cancelar'
    });

    if (!confirm) return;

    const id = this.originalData.id;

    if (id == null) {
      await this.notify.ok({
        variant: 'error',
        title: 'Operación inválida',
        message: 'No se encontró el ID del ciudadano.',
        primaryText: 'Aceptar'
      });

      return;
    }

    try {
      await this.service.update(id, changes as any);

      const UPPER_KEYS = new Set([
        'nombres',
        'apellidoPaterno',
        'apellidoMaterno',
        'domicilio',
        'nacionalidad',
        'direccionActual',
        'detalleDiscapacidad',
        'ocupacion',
        'conocioOtros'
      ]);

      const normalizedChanges = Object.fromEntries(
        Object.entries(changes).map(([k, v]) =>
          typeof v === 'string' && UPPER_KEYS.has(k)
            ? [k, v.toUpperCase()]
            : [k, v]
        )
      );

      this.originalData = {
        ...this.originalData,
        ...(normalizedChanges as any)
      };

      this.form.patchValue(this.originalData);

      if (this.canSeeControl) {
        try {
          const control = await firstValueFrom(this.service.getControlById(id));
          this.aplicarControl(control);
        } catch {
          // El guardado ya fue exitoso; solo falló la carga de control.
        }
      }

      await this.notify.ok({
        variant: 'success',
        title: 'Cambios guardados',
        message: 'La información del ciudadano se actualizó correctamente.',
        primaryText: 'Aceptar'
      });

      this.isEditing = false;
      this.form.disable();
      this.submittedEdit = false;
      this.syncConocioOtros();
    } catch {
      // El interceptor ya mostró el diálogo de error.
    }
  }

  gotoConsulta(): void {
    if (!this.idciudadano || Number.isNaN(this.idciudadano)) return;
    this.router.navigate(['/ciudadano',this.idciudadano,'consulta','registrar',]);
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