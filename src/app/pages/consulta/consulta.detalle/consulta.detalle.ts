import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder,FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VMConsultaDetalleSimple, VMConsultaUpdate, VMConsultaUpdateForm } from '../models/consulta.vm';
import { ConsultaService } from '../services/consulta.service';
import { MapDetalleToUpdate } from '../mappers/consulta.mapper';
import { SeguimientoListaConsulta } from '../../seguimiento/seguimiento.lista.consulta/seguimiento.lista.consulta';
import { ESTADO_CONSULTA_OPCIONES, EstadoConsulta } from '../models/consulta.dominio';
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

  // (si usas paneles colapsables en la UI)
  open = false;
  open2 = true;

  originalData!: VMConsultaUpdate;
  
  estadoOpciones = ESTADO_CONSULTA_OPCIONES;
  form = this.fb.group<ControlsOf<VMConsultaUpdateForm>>({
    resumen:    new FormControl('', { nonNullable: true }),
    hechos:     new FormControl('', { nonNullable: true }),
    materia:    new FormControl('', { nonNullable: true }),
    absolucion: new FormControl('', { nonNullable: true }),
    estado:     new FormControl(0,  { nonNullable: true }),
  });

  ngOnInit(): void {
    this.form.disable();

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.service.getById(id).subscribe({
      next: (data: VMConsultaDetalleSimple) => {
        this.form.patchValue(data);
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
  ngOnDestroy() {
    this.pageMeta.clear();
  }
  // === Edición ===
  onEdit(ev: Event): void {
    ev.stopPropagation();
    this.isEditing = true;
    this.open = true;
    this.form.enable();
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
  }

  // === Guardado ===
  async onSave(): Promise<void> {
    if (!this.form.valid) return;

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
