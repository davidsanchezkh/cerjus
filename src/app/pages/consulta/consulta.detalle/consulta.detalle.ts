import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder,FormControl,Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VMConsultaDetalleSimple, VMConsultaUpdate, VMConsultaUpdateForm } from '../models/consulta.vm';
import { ConsultaService } from '../services/consulta.service';
import { MapDetalleToUpdate } from '../mappers/consulta.mapper';
import { SeguimientoListaConsulta } from '../../seguimiento/seguimiento.lista.consulta/seguimiento.lista.consulta';
import { ESTADO_CONSULTA_OPCIONES, EstadoConsulta,Materia,MATERIA_CONSULTA_OPCIONES } from '../models/consulta.dominio';
// Notificaciones centralizadas
import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';
import { PageMetaService } from '@/app/services/page_meta.service';
@Component({
  selector: 'app-consulta-detalle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SeguimientoListaConsulta],
  templateUrl: './consulta.detalle.html',
  styleUrl: './consulta.detalle.css'
})
export class ConsultaDetalle implements OnInit {

  constructor(private pageMeta: PageMetaService) {}

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(ConsultaService);
  private fb = inject(FormBuilder);
  private notify = inject(NotificacionesService);
  
  idconsulta!: number;
  ciudadanoId!: number;
  isEditing = false;
  submittedEdit = false;  
  isOtros = false; 
  // (si usas paneles colapsables en la UI)
  open = false;
  open2 = true;

  originalData!: VMConsultaUpdate;
  
  estadoOpciones = ESTADO_CONSULTA_OPCIONES;
  materiaOpciones =MATERIA_CONSULTA_OPCIONES;

  form = this.fb.group<ControlsOf<VMConsultaUpdateForm>>({
    resumen:    new FormControl('', { nonNullable: true }),
    hechos:     new FormControl('', { nonNullable: true }),
    materias:      new FormControl<Materia>('', { nonNullable: true }),
    materiaOtros: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(150)] }),
    absolucion: new FormControl('', { nonNullable: true }),
    estado:     new FormControl(0 as unknown as EstadoConsulta,  { nonNullable: true }),
  });

  ngOnInit(): void {
    this.form.disable();
    this.form.get('materias')!.valueChanges.subscribe(() => this.syncMateriaOtros())

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.service.getById(id).subscribe({
      next: (data: VMConsultaDetalleSimple) => {
        this.form.patchValue(data);
        this.syncMateriaOtros(); 
        this.originalData = MapDetalleToUpdate(data);
        this.idconsulta = id;
        this.ciudadanoId = data.idciudadano;
        this.pageMeta.replace({ titulo: `Consulta Nº${data.id ?? id}` , ruta: ['/ciudadano', data.idciudadano] })
      },
      error: () => {
        // El interceptor ya mostró el diálogo (404, etc.).
      }
    });
  }
  private syncMateriaOtros() {
    const value = this.form.get('materias')!.value as Materia;
    const otrosCtrl = this.form.get('materiaOtros')!;
    this.isOtros  = (value === 'OTROS');
    
    if (this.isOtros ) {
      // No deshabilites; sólo exige contenido y largo
      otrosCtrl.setValidators([Validators.required, Validators.maxLength(150)]);
    } else {
      // Limpia y quita validadores, pero deja el control habilitado
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
    const v = this.form.value;
    if (v.materias === 'OTROS' && !v.materiaOtros?.toString().trim()) {
      return 'Indique la materia en “Otros”.';
    }
    return null;
  }

  ngOnDestroy() {
    this.pageMeta.clear();
  }
  // === Edición ===
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
    this.form.reset(this.originalData);
    this.isEditing = false;
    this.form.disable();
    this.submittedEdit = false;
    this.syncMateriaOtros();
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
    // 2) Regla de negocio local
    const msgOtros = this.validaMateriaOtros();
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
      await this.notify.ok({
        variant: 'error',
        title: 'Operación inválida',
        message: 'No se encontró el ID de la consulta.',
        primaryText: 'Aceptar'
      });
      return;
    }

    try {
      await this.service.update(id, changes as any);

      // Actualizar original + form (sin normalización a mayúsculas; conserva el texto)
      this.originalData = { ...this.originalData, ...(changes as any) };
      this.form.patchValue(this.originalData);

      await this.notify.ok({
        variant: 'success',
        title: 'Cambios guardados',
        message: 'La información de la consulta se actualizó correctamente.',
        primaryText: 'Aceptar'
      });

      this.isEditing = false;
      this.form.disable();
      this.submittedEdit = false;
    } catch {
      // El interceptor ya mostró el diálogo de error (title/message del backend).
    }
  }

  gotoSeguimiento(): void {
    this.router.navigate(['/seguimiento/registrar', this.idconsulta]);
  }

  // === Utilidad ===
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
