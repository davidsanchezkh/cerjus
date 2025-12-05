import { Component, Input, OnInit, inject } from '@angular/core';
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
export class UsuarioHorarioListaUsuario implements OnInit {
  private fb = inject(FormBuilder);
  private usuarioHorarioService = inject(UsuarioHorarioService);
  private horarioService = inject(HorarioService);
  private notify = inject(NotificacionesService);

  @Input() idUsuario?: number;

  asignarForm = this.fb.group({
    horarioId: [null as number | null, [Validators.required]],
    desde: [''],           // "YYYY-MM-DD"
    hasta: [''],           // "YYYY-MM-DD"
    cerrarAnterior: [true],
  });

  horarios: VMHorarioListaSimple[] = [];
  items: VMUsuarioHorarioListaItem[] = [];

  loading = false;

  ngOnInit(): void {
    this.loadHorariosActivos();
    if (this.idUsuario != null) {
      this.loadAsignaciones();
    }
  }

  ngOnChanges(): void {
    if (this.idUsuario != null) {
      this.loadAsignaciones();
    }
  }

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
    this.loading = true;
    this.usuarioHorarioService
      .listByUsuario(this.idUsuario)
      .subscribe({
        next: (rows) => {
          this.items = rows ?? [];
          this.loading = false;
        },
        error: () => {
          this.items = [];
          this.loading = false;
        },
      });
  }

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

    const v = this.asignarForm.value;
    const vm: VMUsuarioHorarioCreate = {
      usuarioId: this.idUsuario,
      horarioId: v.horarioId as number,
      desde: v.desde || undefined,
      hasta: v.hasta || undefined,
      cerrarAnterior: !!v.cerrarAnterior,
    };

    // Validación simple de rango en cliente (el backend también valida)
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
      this.loading = true;
      await this.usuarioHorarioService.create(vm);

      await this.notify.ok({
        variant: 'success',
        title: 'Horario asignado',
        message: 'El horario se asignó correctamente al usuario.',
        primaryText: 'Aceptar',
      });

      // Reset del formulario y recarga de lista
      this.asignarForm.reset({
        horarioId: null,
        desde: '',
        hasta: '',
        cerrarAnterior: true,
      });
      this.loadAsignaciones();
    } catch {
      // El interceptor global maneja errores HTTP
      this.loading = false;
    }
  }
}
