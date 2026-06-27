import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule,FormBuilder,FormControl,Validators} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {VMConsultaDetalleSimple,VMConsultaUpdate,VMConsultaUpdateForm,VMConsultaControl,} from '../models/consulta.vm';

import { ConsultaService } from '../services/consulta.service';
import { MapDetalleToUpdate } from '../mappers/consulta.mapper';
import { SeguimientoListaConsulta } from '../../seguimiento/seguimiento.lista.consulta/seguimiento.lista.consulta';

import {Materia,MATERIA_CONSULTA_OPCIONES,LLEVA_CASO_OPCIONES,LlevaCasoConNosotros,} from '../models/consulta.dominio';

import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';
import { PageMetaService } from '@/app/services/page_meta.service';
import { firstValueFrom, Subscription } from 'rxjs';


@Component({
  selector: 'app-consulta-detalle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SeguimientoListaConsulta],
  templateUrl: './consulta.detalle.html',
  styleUrl: './consulta.detalle.css'
})
export class ConsultaDetalle implements OnInit, OnDestroy {
  

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(ConsultaService);
  private fb = inject(FormBuilder);
  private notify = inject(NotificacionesService);
  private pageMeta = inject(PageMetaService);
  private subMateria?: Subscription;

  idconsulta!: number;
  ciudadanoId!: number;

  isEditing = false;
  submittedEdit = false;
  isOtros = false;

  open = false;
  open2 = true;

  originalData!: VMConsultaUpdate;
  originalFormData!: ConsultaDetalleForm;

  materiaOpciones = MATERIA_CONSULTA_OPCIONES;
  llevaCasoOpciones = LLEVA_CASO_OPCIONES;

  canSeeControl = true;

  creadoPorNombre: string | null = null;
  creadoPorDni: string | null = null;
  fechaCreadoPor: Date | string | null = null;

  modificadoPorNombre: string | null = null;
  modificadoPorDni: string | null = null;
  fechaModificadoPor: Date | string | null = null;

  form = this.fb.group<ControlsOf<ConsultaDetalleForm>>({
    resumen: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(200)],
    }),

    hechos: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(600)],
    }),

    materias: new FormControl<Materia>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    materiaOtros: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(150)],
    }),

    absolucion: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(600)],
    }),

    llevaCaso: new FormControl<LlevaCasoConNosotros>('NO', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    observaciones: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(600)],
    }),

    fechaRegistrada: new FormControl('', {
      nonNullable: true,
    }),
  });

  ngOnInit(): void {
    this.form.disable();

    const id = Number(
      this.route.snapshot.paramMap.get('idconsulta') ??
      this.route.snapshot.paramMap.get('id')
    );

    if (!id) return;

    this.idconsulta = id;

    const idciudadanoRuta = Number(this.route.snapshot.paramMap.get('idciudadano'));

    this.pageMeta.replace({
      titulo: 'Consulta Nº',
      ruta: !isNaN(idciudadanoRuta) && idciudadanoRuta > 0
        ? ['/ciudadano', idciudadanoRuta]
        : ['/consulta'],
    });

    this.subMateria = this.form.get('materias')!.valueChanges.subscribe(() => {
      this.syncMateriaOtros();
    });

    this.service.getById(id).subscribe({
      next: (data: VMConsultaDetalleSimple) => {
        this.aplicarDetalle(data);

        this.service.getControlById(id).subscribe({
          next: (control) => this.aplicarControl(control),
          error: () => {
            // Si no carga auditoría, no bloquea el detalle.
          },
        });
      },
      error: () => {
        // El interceptor ya mostró el diálogo.
      }
    });
  }
  ngOnDestroy(): void {
    this.subMateria?.unsubscribe();
    this.pageMeta.clear();
  }
  private aplicarDetalle(data: VMConsultaDetalleSimple): void {
    const formData: ConsultaDetalleForm = {
      resumen: data.resumen ?? '',
      hechos: data.hechos ?? '',
      materias: data.materias ?? '',
      materiaOtros: data.materiaOtros ?? '',
      absolucion: data.absolucion ?? '',
      llevaCaso: data.llevaCaso ?? 'NO',
      observaciones: data.observaciones ?? '',
      fechaRegistrada: data.fechaRegistrada ?? '',
    };

    this.form.patchValue(formData);

    this.syncMateriaOtros();

    this.originalFormData = { ...formData };
    this.originalData = MapDetalleToUpdate(data);

    this.idconsulta = data.id;
    this.ciudadanoId = data.idciudadano;

    this.pageMeta.set({
      titulo: `Consulta Nº${data.id ?? this.idconsulta} - DNI: ${data.dni ?? ''}`,
    });
  }

  private aplicarControl(control: VMConsultaControl): void {
    this.creadoPorNombre = control.creadoPorNombre ?? null;
    this.creadoPorDni = control.creadoPorDni ?? null;
    this.fechaCreadoPor = control.fechaCreadoPor ?? null;

    this.modificadoPorNombre = control.modificadoPorNombre ?? null;
    this.modificadoPorDni = control.modificadoPorDni ?? null;
    this.fechaModificadoPor = control.fechaModificadoPor ?? null;
  }

  private syncMateriaOtros(): void {
    const value = this.form.get('materias')!.value as Materia;
    const otrosCtrl = this.form.get('materiaOtros')!;

    this.isOtros = value === 'OTROS';

    if (this.isOtros) {
      otrosCtrl.setValidators([Validators.required, Validators.maxLength(150)]);
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



  private validaMateriaOtros(): string | null {
    const v = this.form.getRawValue();

    if (v.materias === 'OTROS' && !v.materiaOtros?.toString().trim()) {
      return 'Indique la materia en “Otros”.';
    }

    return null;
  }

  

  onEdit(ev: Event): void {
    ev.stopPropagation();

    this.submittedEdit = false;
    this.isEditing = true;
    this.open = true;

    this.form.enable();
    this.syncMateriaOtros();
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

    this.form.reset(this.originalFormData);

    this.isEditing = false;
    this.form.disable();
    this.submittedEdit = false;

    this.syncMateriaOtros();
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

    const msgOtros = this.validaMateriaOtros();

    if (msgOtros) {
      await this.notify.ok({
        variant: 'warning',
        title: 'Falta información',
        message: msgOtros,
        primaryText: 'Aceptar',
      });

      return;
    }

    const raw = this.form.getRawValue();

    const currentForm: ConsultaDetalleForm = {
      resumen: raw.resumen,
      hechos: raw.hechos,
      materias: raw.materias,
      materiaOtros: raw.materiaOtros,
      absolucion: raw.absolucion,
      llevaCaso: raw.llevaCaso,
      observaciones: raw.observaciones,
      fechaRegistrada: raw.fechaRegistrada,
    };

    const changes: VMConsultaUpdateForm = {};

    if (currentForm.resumen !== this.originalFormData.resumen) {
      changes.resumen = currentForm.resumen;
    }

    if (currentForm.hechos !== this.originalFormData.hechos) {
      changes.hechos = currentForm.hechos;
    }

    if (currentForm.materias !== this.originalFormData.materias) {
      changes.materias = currentForm.materias;
    }

    if (currentForm.materiaOtros !== this.originalFormData.materiaOtros) {
      changes.materiaOtros = currentForm.materiaOtros;
    }

    if (currentForm.absolucion !== this.originalFormData.absolucion) {
      changes.absolucion = currentForm.absolucion;
    }

    if (currentForm.llevaCaso !== this.originalFormData.llevaCaso) {
      changes.llevaCaso = currentForm.llevaCaso;
    }

    if (currentForm.observaciones !== this.originalFormData.observaciones) {
      changes.observaciones = currentForm.observaciones;
    }

    if (currentForm.fechaRegistrada !== this.originalFormData.fechaRegistrada) {
      changes.fechaRegistrada = currentForm.fechaRegistrada || null;
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

    const id = this.originalData.id;

    if (id == null) {
      await this.notify.ok({
        variant: 'error',
        title: 'Operación inválida',
        message: 'No se encontró el ID de la consulta.',
        primaryText: 'Aceptar',
      });

      return;
    }

    try {
      await this.service.update(id, changes);

      const detalle = await firstValueFrom(this.service.getById(id));
      this.aplicarDetalle(detalle);

      this.service.getControlById(id).subscribe({
        next: (control) => this.aplicarControl(control),
        error: () => {},
      });

      await this.notify.ok({
        variant: 'success',
        title: 'Cambios guardados',
        message: 'La información de la consulta se actualizó correctamente.',
        primaryText: 'Aceptar',
      });

      this.isEditing = false;
      this.form.disable();
      this.submittedEdit = false;

      this.syncMateriaOtros();
    } catch {
      // El interceptor ya mostró el error.
    }
  }

  gotoSeguimiento(): void {
    const idciudadanoRuta = Number(this.route.snapshot.paramMap.get('idciudadano'));

    if (!isNaN(idciudadanoRuta) && idciudadanoRuta > 0) {
      this.router.navigate([
        '/ciudadano',
        idciudadanoRuta,
        'consulta',
        this.idconsulta,
        'seguimiento',
        'registrar',
      ]);
      return;
    }

    this.router.navigate([
      '/consulta',
      this.idconsulta,
      'seguimiento',
      'registrar',
    ]);
  }

  private hasUnsavedChanges(): boolean {
    const v = this.form.getRawValue() as Record<string, unknown>;
    const o = this.originalFormData as Record<string, unknown>;

    for (const k of Object.keys(v)) {
      if (v[k] !== o[k]) return true;
    }

    return false;
  }
}

type ConsultaDetalleForm = {
  resumen: string;
  hechos: string;
  materias: Materia;
  materiaOtros: string;
  absolucion: string;
  llevaCaso: LlevaCasoConNosotros;
  observaciones: string;
  fechaRegistrada: string;
};

type ControlsOf<T> = {
  [K in keyof T]: FormControl<T[K]>;
};
