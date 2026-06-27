import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule,FormBuilder,Validators,FormControl,ValidatorFn,AbstractControl,} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { VMConsultaCreate,VMConsultaCiudadanoResumen } from '../models/consulta.vm';
import { ConsultaService } from '../services/consulta.service';
import {MATERIA_CONSULTA_OPCIONES,Materia,LLEVA_CASO_OPCIONES,LlevaCasoConNosotros,} from '../models/consulta.dominio';

import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';
import { Subscription } from 'rxjs';
import { PageMetaService } from '@/app/services/page_meta.service';

const noInicialMateria: ValidatorFn = (c: AbstractControl) =>
  c.value === '' ? { placeholder: true } : null;

@Component({
  selector: 'app-consulta-registrar',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './consulta.registrar.html',
  styleUrl: './consulta.registrar.css'
})
export class ConsultaRegistar implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private service = inject(ConsultaService);
  private notify = inject(NotificacionesService);
  private pageMeta = inject(PageMetaService);
  private subForm = new Subscription();

  readonly materiaOpciones = MATERIA_CONSULTA_OPCIONES;
  readonly llevaCasoOpciones = LLEVA_CASO_OPCIONES;

  submitting = false;
  errorMessage = '';

  requiereCiudadano = false;
  buscandoCiudadano = false;
  ciudadanoBuscado = false;
  ciudadanoEncontrado: VMConsultaCiudadanoResumen | null = null;

  private readonly dniMin = 8;
  private ciudadanoReqSeq = 0;

  form = this.fb.group<ControlsOf<VMConsultaCreateForm>>({
    idciudadano: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),

    dniBusqueda: new FormControl('', {
      nonNullable: true,
      validators: [Validators.pattern(/^\d{0,11}$/)],
    }),

    resumen: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(200)],
    }),

    hechos: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(600)],
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

    usarFechaRegistrada: new FormControl(false, {
      nonNullable: true,
    }),

    fechaRegistrada: new FormControl({ value: '', disabled: true }, {
      nonNullable: true,
    }),

    materias: new FormControl<Materia>('', {
      nonNullable: true,
      validators: [Validators.required, noInicialMateria],
    }),

    materiaOtros: new FormControl({ value: '', disabled: true }, {
      nonNullable: true,
      validators: [Validators.maxLength(150)],
    }),
  });

  ngOnInit(): void {
    const id = Number(
      this.route.snapshot.paramMap.get('idciudadano') ??
      this.route.snapshot.paramMap.get('id')
    );

    this.pageMeta.replace({
      titulo: 'Registrar Nueva Consulta',
      ruta: !isNaN(id) && id > 0
        ? ['/ciudadano', id]
        : ['/consulta'],
    });

    if (!isNaN(id) && id > 0) {
      this.requiereCiudadano = false;
      this.form.patchValue({ idciudadano: id });
    } else {
      this.requiereCiudadano = true;
      this.form.patchValue({ idciudadano: 0 });
    }

    this.subForm.add(
      this.form.get('materias')!.valueChanges.subscribe(() => {
        this.syncMateriaOtros();
      })
    );

    this.subForm.add(
      this.form.get('usarFechaRegistrada')!.valueChanges.subscribe(() => {
        this.syncFechaRegistrada();
      })
    );

    this.subForm.add(
      this.form.get('dniBusqueda')!.valueChanges
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
        )
        .subscribe(() => {
          if (this.requiereCiudadano) this.buscarCiudadanoPorDni();
        })
    );

    this.syncMateriaOtros();
    this.syncFechaRegistrada();
  }
  ngOnDestroy(): void {
    this.subForm.unsubscribe();
    this.pageMeta.clear();
  }

  private limpiarPanelCiudadano(): void {
    this.buscandoCiudadano = false;
    this.ciudadanoBuscado = false;
    this.ciudadanoEncontrado = null;
    this.form.patchValue({ idciudadano: 0 }, { emitEvent: false });
  }

  private buscarCiudadanoPorDni(): void {
    const dni = this.form.get('dniBusqueda')!.value.trim();
    const myReq = ++this.ciudadanoReqSeq;

    this.limpiarPanelCiudadano();

    if (dni.length < this.dniMin) return;

    this.buscandoCiudadano = true;

    this.service.getResumenByDni(dni).subscribe({
      next: (c) => {
      if (myReq !== this.ciudadanoReqSeq) return;

      this.ciudadanoEncontrado = c;
      this.ciudadanoBuscado = true;
      this.buscandoCiudadano = false;
      this.form.patchValue({ idciudadano: c?.id ?? 0 }, { emitEvent: false });
    },
    error: () => {
      if (myReq !== this.ciudadanoReqSeq) return;

      this.ciudadanoEncontrado = null;
      this.ciudadanoBuscado = true;
      this.buscandoCiudadano = false;
      this.form.patchValue({ idciudadano: 0 }, { emitEvent: false });
    }
    });
  }

  limpiarCiudadano(): void {
    this.ciudadanoReqSeq++;
    this.form.patchValue({
      dniBusqueda: '',
      idciudadano: 0,
    });
    this.limpiarPanelCiudadano();
  }

  private syncMateriaOtros() {
    const value = this.form.get('materias')!.value as Materia;
    const otrosCtrl = this.form.get('materiaOtros')!;

    if (value === 'OTROS') {
      otrosCtrl.enable({ emitEvent: false });
      otrosCtrl.setValidators([Validators.required, Validators.maxLength(150)]);
    } else {
      otrosCtrl.clearValidators();
      otrosCtrl.setValue('', { emitEvent: false });
      otrosCtrl.disable({ emitEvent: false });
    }

    otrosCtrl.updateValueAndValidity({ emitEvent: false });
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

  private validaMateriaOtros(): string | null {
    const v = this.form.getRawValue();

    if (v.materias === 'OTROS' && !v.materiaOtros?.toString().trim()) {
      return 'Indique la materia en “Otros”.';
    }

    return null;
  }

  async onSubmit() {
    const raw = this.form.getRawValue();
    
    if (this.requiereCiudadano && raw.idciudadano <= 0) {
      await this.notify.ok({
        variant: 'warning',
        title: 'Ciudadano no seleccionado',
        message: 'El DNI no ha sido encontrado. Debes seleccionar un ciudadano válido para registrar la consulta.',
        primaryText: 'Aceptar'
      });

      return;
    }

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

    this.submitting = true;

    try {
      const vm: VMConsultaCreate = {
        idciudadano: raw.idciudadano,
        resumen: raw.resumen,
        hechos: raw.hechos,
        materias: raw.materias,
        materiaOtros: raw.materiaOtros,
        absolucion: raw.absolucion,
        llevaCaso: raw.llevaCaso,
        observaciones: raw.observaciones,
        fechaRegistrada: raw.usarFechaRegistrada ? raw.fechaRegistrada : null,
      };

      const consultaId = await this.service.create(vm);

      await this.notify.ok({
        variant: 'success',
        title: 'Consulta registrada',
        message: 'La consulta se creó correctamente.',
        primaryText: 'Ver detalle'
      });

      this.navergar(consultaId);
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

  private navergar(consultaId?: number) {
  const id = Number(
      this.route.snapshot.paramMap.get('idciudadano') ??
      this.route.snapshot.paramMap.get('id')
    );

    if (typeof consultaId === 'number' && !isNaN(consultaId)) {
      if (!isNaN(id) && id > 0) {
        this.router.navigate(['/ciudadano', id, 'consulta', consultaId]);
      } else {
        this.router.navigate(['/consulta', consultaId]);
      }
      return;
    }

    if (!isNaN(id) && id > 0) {
      this.router.navigate(['/ciudadano', id]);
    } else {
      this.router.navigate(['/consulta']);
    }
  }

}

type VMConsultaCreateForm = VMConsultaCreate & {
  usarFechaRegistrada: boolean;
  dniBusqueda: string;
};

type ControlsOf<T> = {
  [K in keyof T]: FormControl<T[K]>;
};