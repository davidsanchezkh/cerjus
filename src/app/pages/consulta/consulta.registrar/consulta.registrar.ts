import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder,Validators,FormControl,ValidatorFn, AbstractControl,FormGroup} from '@angular/forms';
import { Router,ActivatedRoute } from '@angular/router';
import { VMConsultaCreate} from '../models/consulta.vm'
import { ConsultaService } from '../services/consulta.service';
import { MATERIA_CONSULTA_OPCIONES, Materia } from '../models/consulta.dominio';
// Notificaciones centralizadas
import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';

const noInicialMateria: ValidatorFn = (c: AbstractControl) =>
  c.value === '' ? { placeholder: true } : null;
@Component({
  selector: 'app-consulta-registrar',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './consulta.registrar.html',
  styleUrl: './consulta.registrar.css'
})export class ConsultaRegistar  {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private service = inject(ConsultaService);
  private notify = inject(NotificacionesService);

  readonly materiaOpciones = MATERIA_CONSULTA_OPCIONES;

  submitting = false;
  errorMessage = '';

  form = this.fb.group<ControlsOf<VMConsultaCreate>>({
    idciudadano: new FormControl(0, { nonNullable: true, validators: [Validators.required] }),
    resumen: new FormControl('', { nonNullable: true}),
    hechos: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    absolucion: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    regresa: new FormControl('', { nonNullable: true, validators: [Validators.required] }),

    materias: new FormControl<Materia>('', { nonNullable: true,  validators: [Validators.required, noInicialMateria] }),
    materiaOtros: new FormControl({ value: '', disabled: true }, { nonNullable: true, validators: [Validators.maxLength(150)] }),
  });

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!isNaN(id) && id > 0) {
      this.form.get('materias')!.valueChanges.subscribe(() => this.syncMateriaOtros());
      this.form.patchValue({ idciudadano: id });
    }
  }
  private syncMateriaOtros() {
    const value = this.form.get('materias')!.value as Materia;
    const otrosCtrl = this.form.get('materiaOtros')!;
    if (value === 'OTROS') {
      otrosCtrl.enable({ emitEvent: false });
      otrosCtrl.addValidators(Validators.required);
    } else {
      otrosCtrl.clearValidators();
      otrosCtrl.setValue('', { emitEvent: false });
      otrosCtrl.disable({ emitEvent: false });
    }
    otrosCtrl.updateValueAndValidity({ emitEvent: false });
  }
  /** Regla local: si materias = OTROS, exigir detalle */
  private validaMateriaOtros(): string | null {
    const v = this.form.value;
    if (v.materias === 'OTROS' && !v.materiaOtros?.toString().trim()) {
      return 'Indique la materia en “Otros”.';
    }
    return null;
  }

  async onSubmit() {
    // 1) Validación de formulario
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

    this.submitting = true;

    try {
      // 3) Envío (errores → interceptor muestra diálogo con title/message del backend)
      const vm: VMConsultaCreate = this.form.getRawValue();
      const createdId = await this.service.create(vm);

      // 4) Éxito: OK bloqueante y navegar
      await this.notify.ok({
        variant: 'success',
        title: 'Consulta registrada',
        message: 'La consulta se creó correctamente.',
        primaryText: 'Ver detalle'
      });

      this.navergar();
    } catch {
      // Nada aquí: el interceptor ya mostró el error adecuado
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

  private navergar() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!isNaN(id)) {
      this.router.navigate(['/ciudadano', id]);   // vuelve a la ficha del ciudadano
    } else {
      this.router.navigate(['/consulta']);        // fallback
    }
  }
}
type ControlsOf<T> = {
  [K in keyof T]: FormControl<T[K]>;
};