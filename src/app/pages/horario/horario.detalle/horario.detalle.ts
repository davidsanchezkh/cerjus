import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HorarioService } from '../services/horario.service';
import { VMHorarioDetalle, VMHorarioBloque } from '../models/horario.vm';
import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';
import { PageMetaService } from '@/app/services/page_meta.service';

@Component({
  selector: 'app-horario-detalle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './horario.detalle.html',
  styleUrl: './horario.detalle.css',
})
export class HorarioDetalle implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(HorarioService);
  private fb = inject(FormBuilder);
  private notify = inject(NotificacionesService);
  private pageMeta = inject(PageMetaService);

  idhorario!: number;
  isEditing = false;
  open = true;
  bloques: VMHorarioBloque[] = [];

  form = this.fb.group({
    nombre: new FormControl('', { nonNullable: true }),
    tz: new FormControl('', { nonNullable: true }),
  });

  originalData!: VMHorarioDetalle;

  ngOnInit(): void {
    this.form.disable();

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.service.getById(id).subscribe({
      next: (data: VMHorarioDetalle) => {
        this.form.patchValue({
          nombre: data.nombre,
          tz: data.tz,
        });
        this.originalData = data;
        this.bloques = data.bloques ?? [];
        this.idhorario = id;

        this.pageMeta.replace({
          titulo: `Horario: ${data.nombre}`,
          ruta: ['/horario'],
        });
      },
      error: () => {
        // Interceptor maneja errores
      },
    });
  }

  ngOnDestroy() {
    this.pageMeta.clear();
  }

  onEdit(ev: Event): void {
    ev.stopPropagation();
    this.isEditing = true;
    this.open = true;
    this.form.enable();
  }

  async onCancel(): Promise<void> {
    const hasChanges =
      this.form.value.nombre !== this.originalData.nombre ||
      this.form.value.tz !== this.originalData.tz;

    if (hasChanges) {
      const ok = await this.notify.confirm({
        variant: 'warning',
        title: 'Descartar cambios',
        message: 'Hay cambios sin guardar. ¿Deseas descartarlos?',
        confirmText: 'Descartar',
        cancelText: 'Seguir editando',
      });
      if (!ok) return;
    }

    this.form.patchValue({
      nombre: this.originalData.nombre,
      tz: this.originalData.tz,
    });
    this.form.disable();
    this.isEditing = false;
  }

  async onSave(): Promise<void> {
    const nombre = this.form.value.nombre ?? '';
    const tz = this.form.value.tz ?? '';

    if (!nombre.trim()) {
      await this.notify.ok({
        variant: 'warning',
        title: 'Datos incompletos',
        message: 'Debe ingresar un nombre válido.',
        primaryText: 'Aceptar',
      });
      return;
    }

    const cambios: any = {};
    if (nombre.trim() !== this.originalData.nombre) cambios.ho_nombre = nombre;
    if (tz.trim() !== this.originalData.tz) cambios.ho_tz = tz;

    if (Object.keys(cambios).length === 0) {
      await this.notify.ok({
        variant: 'info',
        title: 'Sin cambios',
        message: 'No hay cambios que guardar.',
        primaryText: 'Aceptar',
      });
      return;
    }

    const confirm = await this.notify.confirm({
      variant: 'info',
      title: 'Guardar cambios',
      message: '¿Deseas guardar los cambios del horario?',
      confirmText: 'Guardar',
      cancelText: 'Cancelar',
    });
    if (!confirm) return;

    try {
      await this.service.update(this.idhorario, cambios);
      await this.notify.ok({
        variant: 'success',
        title: 'Cambios guardados',
        message: 'El horario se actualizó correctamente.',
        primaryText: 'Aceptar',
      });

      this.originalData = {
        ...this.originalData,
        nombre,
        tz,
      };

      this.form.disable();
      this.isEditing = false;
    } catch {
      // Error ya manejado por interceptor global
    }
  }
}
