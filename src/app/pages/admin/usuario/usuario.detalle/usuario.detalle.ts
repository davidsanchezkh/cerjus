import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  VMUsuarioDetalle,
  VMUsuarioUpdate,
  VMUsuarioUpdateForm,
} from '../models/usuario.vm';
import { ApiTipoUsuario  } from '../models/usuario.api';
import { UsuarioService } from '../services/usuario.service';

import {
  EstadoUsuario,
  ESTADO_USUARIO_OPCIONES,
  estadoUsuarioToLabel,
} from '../models/usuario.dominio';

import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';
import { PageMetaService } from '@/app/services/page_meta.service';

import { UsuarioHorarioListaUsuario } from 'src/app/pages/admin/usuario_horario/usuario_horario.lista.usuario/usuario_horario.lista.usuario';

@Component({
  selector: 'app-usuario-detalle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UsuarioHorarioListaUsuario],
  templateUrl: './usuario.detalle.html',
  styleUrl: './usuario.detalle.css',
})
export class UsuarioDetalle implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private notify = inject(NotificacionesService);
  private pageMeta = inject(PageMetaService);
  private usuarioService = inject(UsuarioService);
  resettingPass = false;

  usuario?: VMUsuarioDetalle;
  tipos: ApiTipoUsuario[] = [];

  isEditing = false;
  submittedEdit = false;
  open = true;

  estadoOpciones = ESTADO_USUARIO_OPCIONES;

  openHorarios = true;

  originalData!: VMUsuarioUpdate;

  form = this.fb.group<ControlsOf<UsuarioDetalleForm>>({
    nombres: new FormControl('', { nonNullable: true }),
    apellidoPaterno: new FormControl('', { nonNullable: true }),
    apellidoMaterno: new FormControl('', { nonNullable: true }),
    dni: new FormControl('', { nonNullable: true }),
    correoE: new FormControl('', { nonNullable: true }),
    telefono: new FormControl('', { nonNullable: true }),
    tz: new FormControl('', { nonNullable: true }),
    fechaCreadoPorTexto: new FormControl('', { nonNullable: true }),

    estado: new FormControl<EstadoUsuario | ''>(1, { nonNullable: true }),
    rolId: new FormControl<number | null>(null, { nonNullable: false }),
  });

  constructor() {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    // Cargar lista de tipos de usuario (roles)
    this.usuarioService.listAll().subscribe({
      next: (rows) => {
        this.tipos = rows ?? [];
      },
      error: () => {
        this.tipos = [];
      },
    });

    // Cargar detalle del usuario
    this.usuarioService.getById(id).subscribe({
      next: (u) => {
        this.usuario = u;

        const fechaTxt = formatDateTime(u.fechaCreadoPor);

        this.form.patchValue({
          nombres: u.nombres,
          apellidoPaterno: u.apellidoPaterno,
          apellidoMaterno: u.apellidoMaterno,
          dni: u.dni,
          correoE: u.correoE,
          telefono: u.telefono,
          tz: u.tz,
          fechaCreadoPorTexto: fechaTxt,
          estado: u.estado,
          rolId: u.rolId ?? null,
        });

        this.originalData = {
          id: u.id,
          estado: u.estado,
          rolId: u.rolId ?? null,
        };

        // Estado y rol NO editables inicialmente
        this.form.get('estado')?.disable({ emitEvent: false });
        this.form.get('rolId')?.disable({ emitEvent: false });

        this.pageMeta.replace({
          titulo: `Usuario: ${u.apellidoPaterno ?? ''} ${u.apellidoMaterno ?? ''}, ${u.nombres ?? ''} - ${u.dni ?? ''}`,
          ruta: ['/admin/usuario/lista'],
        });
      },
      error: () => {
        // El interceptor global ya maneja 404, etc.
      },
    });
  }

  ngOnDestroy(): void {
    this.pageMeta.clear();
  }

  // === Edición (solo rol y estado) ===
  onEdit(ev: Event): void {
    ev.stopPropagation();
    this.submittedEdit = false;
    this.isEditing = true;
    this.open = true;

    // Habilitar solo los campos editables
    this.form.get('estado')?.enable({ emitEvent: false });
    this.form.get('rolId')?.enable({ emitEvent: false });
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

    // Restaurar form
    if (this.usuario) {
      const fechaTxt = formatDateTime(this.usuario.fechaCreadoPor);
      this.form.patchValue({
        nombres: this.usuario.nombres,
        apellidoPaterno: this.usuario.apellidoPaterno,
        apellidoMaterno: this.usuario.apellidoMaterno,
        dni: this.usuario.dni,
        correoE: this.usuario.correoE,
        telefono: this.usuario.telefono,
        tz: this.usuario.tz,
        fechaCreadoPorTexto: fechaTxt,
        estado: this.originalData.estado ?? this.usuario.estado,
        rolId: this.originalData.rolId ?? this.usuario.rolId ?? null,
      });
    }

    // Volver a deshabilitar los campos editables
    this.form.get('estado')?.disable({ emitEvent: false });
    this.form.get('rolId')?.disable({ emitEvent: false });

    this.isEditing = false;
    this.submittedEdit = false;
  }

  // === Guardado ===
  async onSave(): Promise<void> {
    this.submittedEdit = true;

    const v = this.form.value;

    const changes: VMUsuarioUpdateForm = {};

    if (
      v.estado !== undefined &&
      v.estado !== null &&
      v.estado !== this.originalData.estado
    ) {
      changes.estado = v.estado as EstadoUsuario;
    }

    if (v.rolId !== undefined && v.rolId !== this.originalData.rolId) {
      changes.rolId = v.rolId ?? null;
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
        message: 'No se encontró el ID del usuario.',
        primaryText: 'Aceptar',
      });
      return;
    }

    try {
      await this.usuarioService.update(id, changes);

      // Actualizar originalData + usuario local
      this.originalData = { ...this.originalData, ...changes };

      if (this.usuario) {
        if (changes.estado != null) {
          this.usuario.estado = changes.estado;
          this.usuario.estadoTexto = estadoUsuarioToLabel(changes.estado);
        }
        if (changes.rolId !== undefined) {
          const rol = this.tipos.find((t) => t.tu_ID === changes.rolId);
          this.usuario.rolId = changes.rolId ?? null;
          this.usuario.rolNombre = rol?.tu_nombre ?? this.usuario.rolNombre;
          this.usuario.rolNivel = rol?.tu_nivel ?? this.usuario.rolNivel;
        }
      }

      await this.notify.ok({
        variant: 'success',
        title: 'Cambios guardados',
        message: 'La información del usuario se actualizó correctamente.',
        primaryText: 'Aceptar',
      });

      // Bloquear de nuevo los campos editables
      this.form.get('estado')?.disable({ emitEvent: false });
      this.form.get('rolId')?.disable({ emitEvent: false });

      this.isEditing = false;
      this.submittedEdit = false;
    } catch {
      // El interceptor global muestra el error.
    }
  }

  // === Utilidades ===
  private hasUnsavedChanges(): boolean {
    const v = this.form.value;
    if (v.estado !== this.originalData.estado) return true;
    if ((v.rolId ?? null) !== (this.originalData.rolId ?? null)) return true;
    return false;
  }
  async onResetContrasenaProvisional(ev: Event): Promise<void> {
    ev.stopPropagation();

    const id = this.usuario?.id ?? this.originalData?.id;
    if (!id) {
      await this.notify.ok({
        variant: 'error',
        title: 'Operación inválida',
        message: 'No se encontró el ID del usuario.',
        primaryText: 'Aceptar',
      });
      return;
    }

    // (Opcional) Bloquear reset si está eliminado (ya está en disabled del botón)
    if (this.usuario?.estado === 0) {
      await this.notify.ok({
        variant: 'warning',
        title: 'Acción no permitida',
        message: 'No se puede generar contraseña provisional para un usuario eliminado.',
        primaryText: 'Aceptar',
      });
      return;
    }

    const ok = await this.notify.confirm({
      variant: 'warning',
      title: 'Generar contraseña provisional',
      message:
        'Esto reemplazará la contraseña actual del usuario por una contraseña temporal.\n\n' +
        'Comparta la contraseña temporal con el usuario para que ingrese y luego la cambie en "Mi contraseña".\n\n' +
        '¿Desea continuar?',
      confirmText: 'Generar',
      cancelText: 'Cancelar',
    });

    if (!ok) return;

    this.resettingPass = true;
    try {
      // length opcional: puede cambiarlo a 8, 10, 12, etc.
      const resp = await this.usuarioService.resetContrasenaProvisional(id, 10);

      const copy = await this.notify.confirm({
        variant: 'info',
        title: 'Contraseña provisional generada',
        message:
          `Contraseña provisional:\n${resp.provisional}\n\n` +
          'Recomendación: Indique al usuario que la cambie apenas ingrese.',
        confirmText: 'Copiar',
        cancelText: 'Cerrar',
      });

      if (copy) {
        try {
          await navigator.clipboard.writeText(resp.provisional);
          await this.notify.ok({
            variant: 'success',
            title: 'Copiado',
            message: 'La contraseña provisional fue copiada al portapapeles.',
            primaryText: 'Aceptar',
          });
        } catch {
          // En algunos contextos el clipboard puede fallar (HTTP, permisos, etc.)
          await this.notify.ok({
            variant: 'warning',
            title: 'No se pudo copiar automáticamente',
            message:
              'No se pudo copiar al portapapeles (por permisos del navegador).\n' +
              'Copie manualmente la contraseña mostrada.',
            primaryText: 'Aceptar',
          });
        }
      }
    } catch {
      // El interceptor global debería mostrar el error (403/404/400/etc.)
    } finally {
      this.resettingPass = false;
    }
  }
  
}

interface UsuarioDetalleForm {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  dni: string;
  correoE: string;
  telefono: string;
  tz: string;
  fechaCreadoPorTexto: string;
  estado: EstadoUsuario | '';
  rolId: number | null;
}

type ControlsOf<T> = {
  [K in keyof T]: FormControl<T[K]>;
};

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
