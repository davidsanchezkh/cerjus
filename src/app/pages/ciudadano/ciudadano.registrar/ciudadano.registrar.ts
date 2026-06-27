import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule,FormBuilder,Validators,FormControl,ValidatorFn,AbstractControl} from '@angular/forms';
import { Router } from '@angular/router';
import { VMCiudadanoCreate } from '../models/ciudadano.vm';
import { CiudadanoService } from '../services/ciudadano.service';
import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';
import { Subscription } from 'rxjs';
import { PageMetaService } from '@/app/services/page_meta.service';
import { Conocio, CONOCIO_CIUDADANO_OPCIONES } from '../models/ciudadano.dominio';


const noInicialConocio: ValidatorFn = (c: AbstractControl) => {
  return c.value === '' ? { placeholder: true } : null;
};

@Component({
  selector: 'app-ciudadano-registrar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ciudadano.registrar.html',
  styleUrl: './ciudadano.registrar.css'
})
export class CiudadanoRegistrar implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private service = inject(CiudadanoService);
  private notify = inject(NotificacionesService);
  private pageMeta = inject(PageMetaService);
  private subForm = new Subscription();
  readonly conocioOpciones = CONOCIO_CIUDADANO_OPCIONES;

  form = this.fb.group<ControlsOf<VMCiudadanoCreate>>({
    nombres: new FormControl('', {nonNullable: true,validators: [Validators.required, Validators.maxLength(50)]}),
    apellidoPaterno: new FormControl('', {nonNullable: true,validators: [Validators.required, Validators.maxLength(25)]}),
    apellidoMaterno: new FormControl('', {nonNullable: true,validators: [Validators.required, Validators.maxLength(25)]}),
    dni: new FormControl('', {nonNullable: true,validators: [Validators.required, Validators.pattern(/^\d{8,11}$/)]}),
    domicilio: new FormControl('', {nonNullable: true,validators: [Validators.required, Validators.maxLength(100)]}),
    nacionalidad: new FormControl('', {nonNullable: true,validators: [Validators.required, Validators.maxLength(50)]}),
    direccionActual: new FormControl('', {nonNullable: true,validators: [Validators.maxLength(150)]}),
    detalleDiscapacidad: new FormControl('', {nonNullable: true,validators: [Validators.maxLength(255)]}),
    ocupacion: new FormControl('', {nonNullable: true,validators: [Validators.required, Validators.maxLength(20)]}),
    fechaNacimiento: new FormControl('', {nonNullable: true,validators: [Validators.required]}),
    hijos: new FormControl(0, {nonNullable: true,validators: [Validators.required, Validators.min(0)]}),
    telefono: new FormControl('', {nonNullable: true,validators: [Validators.required, Validators.pattern(/^\d{7,11}$/)]}),
    correoE: new FormControl('', {nonNullable: true,validators: [Validators.email, Validators.maxLength(255)]}),
    usarFechaRegistrada: new FormControl(false, { nonNullable: true }),
    fechaRegistrada: new FormControl({ value: '', disabled: true }, {nonNullable: true}),
    supo: new FormControl<Conocio>('', {nonNullable: true,validators: [Validators.required, noInicialConocio],}),
    supoOtrosDetalle: new FormControl({ value: '', disabled: true }, {nonNullable: true,validators: [Validators.maxLength(30)]})
  });

  submitting = false;

  ngOnInit(): void {
    this.pageMeta.replace({
      titulo: 'Registrar Nuevo Ciudadano',
      ruta: ['/ciudadano'],
    });

    this.subForm.add(
      this.form.get('usarFechaRegistrada')!.valueChanges.subscribe(() => {
        this.syncFechaRegistrada();
      })
    );

    this.subForm.add(
      this.form.get('supo')!.valueChanges.subscribe(() => {
        this.syncSupoOtros();
      })
    );

    this.syncFechaRegistrada();
    this.syncSupoOtros();
  }
  ngOnDestroy(): void {
    this.subForm.unsubscribe();
    this.pageMeta.clear();
  }
  private syncFechaRegistrada(): void {
    const usar = this.form.get('usarFechaRegistrada')!.value;
    const fechaCtrl = this.form.get('fechaRegistrada')!;

    if (usar) {
      fechaCtrl.enable({ emitEvent: false });
      fechaCtrl.setValidators([Validators.required]);
    } else {
      fechaCtrl.setValue('', { emitEvent: false });
      fechaCtrl.clearValidators();
      fechaCtrl.disable({ emitEvent: false });
    }

    fechaCtrl.updateValueAndValidity({ emitEvent: false });
  }

  private validaSupo(): string | null {
    const v = this.form.getRawValue();

    if (v.supo === 'OTROS' && !v.supoOtrosDetalle?.trim()) {
      return 'Indique cómo conoció el servicio en “Otros”.';
    }

    return null;
  }

  async onSubmit() {
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

    const msgSupo = this.validaSupo();
    if (msgSupo) {
      await this.notify.ok({
        variant: 'warning',
        title: 'Falta información',
        message: msgSupo,
        primaryText: 'Aceptar'
      });

      return;
    }

    this.submitting = true;

    try {
      const vm: VMCiudadanoCreate = this.form.getRawValue();
      const createdId = await this.service.create(vm);

      await this.notify.ok({
        variant: 'success',
        title: 'Registro completado',
        message: 'El ciudadano se creó correctamente.',
        primaryText: 'Ver ficha'
      });

      this.router.navigate(['/ciudadano', createdId]);
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

    this.router.navigateByUrl('/ciudadano');
  }
  private syncSupoOtros(): void {
    const value = this.form.get('supo')!.value;
    const otrosCtrl = this.form.get('supoOtrosDetalle')!;

    if (value === 'OTROS') {
      otrosCtrl.enable({ emitEvent: false });
      otrosCtrl.setValidators([Validators.required, Validators.maxLength(30)]);
    } else {
      otrosCtrl.clearValidators();
      otrosCtrl.setValue('', { emitEvent: false });
      otrosCtrl.disable({ emitEvent: false });
    }

    otrosCtrl.updateValueAndValidity({ emitEvent: false });
  }
  
}

type ControlsOf<T> = {
  [K in keyof T]: FormControl<T[K]>;
};