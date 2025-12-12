import { Component, Input, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { UsuarioHorarioService } from '../services/usuario_horario.service';
import { HorarioService } from 'src/app/pages/horario/services/horario.service';
import {
  VMUsuarioHorarioListaItem,
  VMUsuarioHorarioCreate,
} from '../models/usuario_horario.vm';
import {
  VMHorarioListaSimple,
  VMHorarioListaOptions,
} from 'src/app/pages/horario/models/horario.vm';
import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';

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

  asignarForm = this.fb.group({
    // arrancamos disabled si no hay usuario
    horarioId: [{ value: null as number | null, disabled: true }, [Validators.required]],
    desde: [''],           // "YYYY-MM-DD"
    hasta: [''],           // "YYYY-MM-DD"
    cerrarAnterior: [true],
  });

  horarios: VMHorarioListaSimple[] = [];
  items: VMUsuarioHorarioListaItem[] = [];

  loading = false;

  ngOnInit(): void {
    this.loadHorariosActivos();
    this.updateHorarioControlState();   // sincronizamos según idUsuario inicial

    if (this.idUsuario != null) {
      this.loadAsignaciones();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idUsuario']) {
      this.updateHorarioControlState();

      if (this.idUsuario != null) {
        this.loadAsignaciones();
      } else {
        this.items = [];
      }
    }
  }

  // --- helpers de estado de carga / habilitado ---

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

  // --- carga de datos ---

  private loadHorariosActivos(): void {
    const opts: VMHorarioListaOptions = {
      page: 1,
      pageSize: 50,
      estado: 1,
    };
    this.horarioService.list(opts).subscribe({
      next: (page) => {
        this.horarios = page.items ?? [];
      },
      error: () => {
        this.horarios = [];
      },
    });
  }

  private loadAsignaciones(): void {
    if (this.idUsuario == null) return;

    this.setLoading(true);
    this.usuarioHorarioService
      .listByUsuario(this.idUsuario)
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

  // --- acción Asignar ---

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

    // Usar getRawValue porque horarioId puede estar disabled en algún momento
    const v = this.asignarForm.getRawValue();
    const vm: VMUsuarioHorarioCreate = {
      usuarioId: this.idUsuario,
      horarioId: v.horarioId as number,
      desde: v.desde || undefined,
      hasta: v.hasta || undefined,
      cerrarAnterior: !!v.cerrarAnterior,
    };

    // Validación simple de rango en cliente
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

      // Reset del formulario
      this.asignarForm.reset({
        horarioId: null,
        desde: '',
        hasta: '',
        cerrarAnterior: true,
      });

      // Reajustar estado enabled/disabled tras reset
      this.updateHorarioControlState();

      // Recargar asignaciones
      this.loadAsignaciones();
    } catch {
      this.setLoading(false);
      // Errores HTTP ya los maneja el interceptor global
    }
  }
}
