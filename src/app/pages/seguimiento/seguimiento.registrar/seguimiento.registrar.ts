import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { VMSeguimientoCreate } from '../models/seguimiento.vm';
import { SeguimientoService } from '../services/seguimiento.service';

import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';
import { PageMetaService } from '@/app/services/page_meta.service';

@Component({
  selector: 'app-seguimiento-registrar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './seguimiento.registrar.html',
  styleUrl: './seguimiento.registrar.css'
})
export class SeguimientoRegistar implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private service = inject(SeguimientoService);
  private notify = inject(NotificacionesService);
  private pageMeta = inject(PageMetaService);

  submitting = false;

  form = this.fb.group<ControlsOf<VMSeguimientoCreate>>({
    idconsulta: new FormControl(0, { nonNullable: true, validators: [Validators.required] }),
    cuerposeguimiento: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  ngOnInit(): void {
    const idconsulta = Number(
      this.route.snapshot.paramMap.get('idconsulta') ??
      this.route.snapshot.paramMap.get('id')
    );

    if (!isNaN(idconsulta) && idconsulta > 0) {
      this.form.patchValue({ idconsulta });
    }

    this.pageMeta.replace({
      titulo: 'Registrar Seguimiento',
      ruta: this.backRoute(),
    });
  }

  ngOnDestroy(): void {
    this.pageMeta.clear();
  }

  private backRoute(): any[] {
    const idciudadano = Number(this.route.snapshot.paramMap.get('idciudadano'));

    const idconsulta = Number(
      this.route.snapshot.paramMap.get('idconsulta') ??
      this.route.snapshot.paramMap.get('id')
    );

    if (!isNaN(idciudadano) && idciudadano > 0 && !isNaN(idconsulta) && idconsulta > 0) {
      return ['/ciudadano', idciudadano, 'consulta', idconsulta];
    }

    if (!isNaN(idconsulta) && idconsulta > 0) {
      return ['/consulta', idconsulta];
    }

    return ['/consulta'];
  }

  private hasClientErrors(): boolean {
    return this.form.invalid;
  }

  async onSubmit() {
    if (this.hasClientErrors()) {
      this.form.markAllAsTouched();

      await this.notify.ok({
        variant: 'warning',
        title: 'Datos incompletos',
        message: 'Revisa los campos obligatorios e inténtalo nuevamente.',
        primaryText: 'Aceptar'
      });

      return;
    }

    this.submitting = true;

    try {
      const vm: VMSeguimientoCreate = this.form.getRawValue();
      await this.service.create(vm);

      await this.notify.ok({
        variant: 'success',
        title: 'Seguimiento registrado',
        message: 'El seguimiento se añadió correctamente.',
        primaryText: 'Volver a la consulta'
      });

      this.navergar();
    } catch {
      // El interceptor ya mostró el error.
    } finally {
      this.submitting = false;
    }
  }

  async onBack() {
    if (this.form.dirty) {
      const ok = await this.notify.confirm({
        variant: 'warning',
        title: 'Descartar cambios',
        message: 'Hay datos sin guardar. ¿Deseas descartarlos?',
        confirmText: 'Descartar',
        cancelText: 'Seguir aquí'
      });

      if (!ok) return;
    }

    this.navergar();
  }

  private navergar(): void {
    this.router.navigate(this.backRoute());
  }
}

type ControlsOf<T> = {
  [K in keyof T]: FormControl<T[K]>;
};
