import { Component, Input, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { UsuarioHorarioService } from '../services/usuario_horario.service';
import { HorarioService } from 'src/app/pages/horario/services/horario.service';
import { VMUsuarioHorarioListaItem, VMUsuarioHorarioCreate } from '../models/usuario_horario.vm';
import { VMHorarioListaSimple, VMHorarioListaOptions } from 'src/app/pages/horario/models/horario.vm';
import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';
import { DTOUsuarioHorarioUpdate } from '../models/usuario_horario.dto';

@Component({
  selector: 'app-usuario-horario-lista-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './usuario_horario.lista.usuario.html',
  styleUrl: './usuario_horario.lista.usuario.css',
})
export class UsuarioHorarioListaUsuario implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  private usuarioHorarioService = inject(UsuarioHorarioService);
  private horarioService = inject(HorarioService);
  private notify = inject(NotificacionesService);

  @Input() idUsuario?: number;

  // Formulario de asignación
  asignarForm = this.fb.group({
    horarioId: [{ value: null as number | null, disabled: true }, [Validators.required]],
    desde: [''],   // YYYY-MM-DD
    hasta: [''],   // YYYY-MM-DD
    cerrarAnterior: [true],
  });

  // Formulario de edición (una fila a la vez)
  editForm = this.fb.group({
    uh_ID: [{ value: null as number | null, disabled: true }],
    desde: [''],
    hasta: [''],
  });

  editingId: number | null = null;

  horarios: VMHorarioListaSimple[] = [];
  items: VMUsuarioHorarioListaItem[] = [];

  loading = false;

  ngOnInit(): void {
    this.loadHorariosActivos();
    this.updateHorarioControlState();

    if (this.idUsuario != null) {
      this.loadAsignacionesAll();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idUsuario']) {
      this.updateHorarioControlState();

      if (this.idUsuario != null) {
        this.loadAsignacionesAll();
      } else {
        this.items = [];
        this.cancelEdit();
      }
    }
  }

  private setLoading(value: boolean): void {
    this.loading = value;
    this.updateHorarioControlState();
  }

  private updateHorarioControlState(): void {
    const ctrl = this.asignarForm.get('horarioId');
    if (!ctrl) return;

    const shouldDisable = this.loading || !this.idUsuario;

    if (shouldDisable && ctrl.enabled) {
      ctrl.disable({ emitEvent: false });
    } else if (!shouldDisable && ctrl.disabled) {
      ctrl.enable({ emitEvent: false });
    }
  }

  /** Para asignar: SOLO horarios activos */
  private loadHorariosActivos(): void {
    const opts: VMHorarioListaOptions = { page: 1, pageSize: 50, estado: 1 };
    this.horarioService.list(opts).subscribe({
      next: (page) => (this.horarios = page.items ?? []),
      error: () => (this.horarios = []),
    });
  }

  /** Para tabla: SIEMPRE traer TODO (activos + eliminados) */
  private loadAsignacionesAll(): void {
    if (this.idUsuario == null) return;

    this.setLoading(true);
    this.usuarioHorarioService
      .listAllByUsuario(this.idUsuario)
      .subscribe({
        next: (rows) => {
          this.items = rows ?? [];
          this.setLoading(false);
        },
        error: () => {
          this.items = [];
          this.setLoading(false);
        },
      });
  }

  // -------------------------
  // Asignar nuevo horario
  // -------------------------
  async onAsignar(): Promise<void> {
    if (!this.idUsuario) {
      await this.notify.ok({
        variant: 'error',
        title: 'Operación inválida',
        message: 'No se encontró el usuario para asignar el horario.',
        primaryText: 'Aceptar',
      });
      return;
    }

    this.asignarForm.markAllAsTouched();
    if (this.asignarForm.invalid) {
      await this.notify.ok({
        variant: 'warning',
        title: 'Datos incompletos',
        message: 'Seleccione un horario antes de continuar.',
        primaryText: 'Aceptar',
      });
      return;
    }

    const v = this.asignarForm.getRawValue();
    const vm: VMUsuarioHorarioCreate = {
      usuarioId: this.idUsuario,
      horarioId: v.horarioId as number,
      desde: v.desde || undefined,
      hasta: v.hasta || undefined,
      cerrarAnterior: !!v.cerrarAnterior,
    };

    if (vm.desde && vm.hasta && vm.hasta < vm.desde) {
      await this.notify.ok({
        variant: 'warning',
        title: 'Rango de fechas inválido',
        message: 'La fecha "Hasta" no puede ser menor que "Desde".',
        primaryText: 'Aceptar',
      });
      return;
    }

    try {
      this.setLoading(true);
      await this.usuarioHorarioService.create(vm);

      await this.notify.ok({
        variant: 'success',
        title: 'Horario asignado',
        message: 'El horario se asignó correctamente al usuario.',
        primaryText: 'Aceptar',
      });

      this.asignarForm.reset({
        horarioId: null,
        desde: '',
        hasta: '',
        cerrarAnterior: true,
      });

      this.updateHorarioControlState();
      this.loadAsignacionesAll();
    } catch {
      this.setLoading(false);
    }
  }

  // -------------------------
  // Edición de asignación
  // -------------------------
  startEdit(row: VMUsuarioHorarioListaItem): void {
    if (this.loading) return;

    this.editingId = row.id;
    this.editForm.reset(
      {
        uh_ID: row.id,
        desde: row.desde ?? '',
        hasta: row.hasta ?? '',
      },
      { emitEvent: false },
    );
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editForm.reset(
      { uh_ID: null, desde: '', hasta: '' },
      { emitEvent: false },
    );
  }

  clearHastaEdit(): void {
    this.editForm.patchValue({ hasta: '' }, { emitEvent: false });
  }

  async saveEdit(row: VMUsuarioHorarioListaItem): Promise<void> {
    if (this.loading) return;
    if (this.editingId !== row.id) return;

    const v = this.editForm.getRawValue();
    const desde = (v.desde ?? '').trim();
    const hasta = (v.hasta ?? '').trim();

    if (desde && hasta && hasta < desde) {
      await this.notify.ok({
        variant: 'warning',
        title: 'Rango inválido',
        message: 'La fecha "Hasta" no puede ser menor que "Desde".',
        primaryText: 'Aceptar',
      });
      return;
    }

    const patch: DTOUsuarioHorarioUpdate = { uh_ID: row.id };

    const rowDesde = row.desde ?? '';
    const rowHasta = row.hasta ?? '';

    if (desde !== rowDesde) {
      if (!desde) {
        await this.notify.ok({
          variant: 'warning',
          title: 'Dato inválido',
          message: 'La fecha "Desde" no puede quedar vacía.',
          primaryText: 'Aceptar',
        });
        return;
      }
      patch.uh_desde = desde;
    }

    if (hasta !== rowHasta) {
      patch.uh_hasta = hasta ? hasta : null; // limpiar => null
    }

    // Importante: si está eliminado (estado 0), el backend exige que se envíe uh_estado
    // para permitir cambios SIN reactivar.
    const tieneCambios = Object.keys(patch).length > 1;
    if (tieneCambios && row.estado === 0) {
      patch.uh_estado = 0;
    }

    if (!tieneCambios) {
      await this.notify.ok({
        variant: 'info',
        title: 'Sin cambios',
        message: 'No hay cambios que guardar en esta asignación.',
        primaryText: 'Aceptar',
      });
      return;
    }

    const ok = await this.notify.confirm({
      variant: 'info',
      title: 'Guardar cambios',
      message: '¿Desea guardar los cambios del rango de fechas?',
      confirmText: 'Guardar',
      cancelText: 'Cancelar',
    });
    if (!ok) return;

    try {
      this.setLoading(true);
      await this.usuarioHorarioService.update(row.id, patch);

      await this.notify.ok({
        variant: 'success',
        title: 'Actualizado',
        message: 'La asignación se actualizó correctamente.',
        primaryText: 'Aceptar',
      });

      this.cancelEdit();
      this.loadAsignacionesAll();
    } catch {
      this.setLoading(false);
    }
  }

  // -------------------------
  // Desactivar / Reactivar
  // -------------------------
  async onDesactivar(row: VMUsuarioHorarioListaItem): Promise<void> {
    if (this.loading) return;

    const ok = await this.notify.confirm({
      variant: 'warning',
      title: 'Desactivar asignación',
      message: 'Esta acción desactivará la asignación del usuario. ¿Desea continuar?',
      confirmText: 'Desactivar',
      cancelText: 'Cancelar',
    });
    if (!ok) return;

    try {
      this.setLoading(true);
      await this.usuarioHorarioService.deactivate(row.id);

      await this.notify.ok({
        variant: 'success',
        title: 'Desactivado',
        message: 'La asignación fue desactivada correctamente.',
        primaryText: 'Aceptar',
      });

      if (this.editingId === row.id) this.cancelEdit();
      this.loadAsignacionesAll();
    } catch {
      this.setLoading(false);
    }
  }

  async onReactivar(row: VMUsuarioHorarioListaItem): Promise<void> {
    if (this.loading) return;

    const ok = await this.notify.confirm({
      variant: 'info',
      title: 'Reactivar asignación',
      message: 'Se reactivará esta asignación. Si se solapa con otra activa, el sistema lo impedirá. ¿Continuar?',
      confirmText: 'Reactivar',
      cancelText: 'Cancelar',
    });
    if (!ok) return;

    try {
      this.setLoading(true);
      await this.usuarioHorarioService.reactivate(row.id);

      await this.notify.ok({
        variant: 'success',
        title: 'Reactivado',
        message: 'La asignación fue reactivada correctamente.',
        primaryText: 'Aceptar',
      });

      if (this.editingId === row.id) this.cancelEdit();
      this.loadAsignacionesAll();
    } catch {
      this.setLoading(false);
    }
  }
}
