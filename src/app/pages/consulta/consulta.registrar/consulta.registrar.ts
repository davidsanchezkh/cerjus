import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder,Validators,AbstractControl,ValidationErrors } from '@angular/forms';
import { Router,ActivatedRoute } from '@angular/router';
import { VMConsultaCreate} from '../models/consulta.vm'
import { ConsultaService } from '../services/consulta.service';
import { FormControl } from '@angular/forms';

type Materia = 'DERECHO FAMILIA' | 'DERECHO PENAL' | 'DERECHO CIVIL' | 
'DERECHO LABORAL' | 'OTROS' | 'INICIAL'|'ERROR';

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

  submitting = false;
  errorMessage = '';

  form = this.fb.group<ControlsOf<VMConsultaCreate>>({
    idciudadano: new FormControl(0, { nonNullable: true }),
    resumen: new FormControl('', { nonNullable: true }),
    hechos: new FormControl('', { nonNullable: true }),
    absolucion: new FormControl('', { nonNullable: true }),
    regresa: new FormControl('', { nonNullable: true }),

    materias: new FormControl<Materia>('INICIAL', { nonNullable: true }),
    materiaOtros: new FormControl({ value: '', disabled: true }, { nonNullable: true })
  });

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    try {
      const vm: VMConsultaCreate = this.form.getRawValue();
      const createdId = await this.service.create(vm);
      
      this.navergar();
      
    } catch (err: any) {
      this.errorMessage = err.message ?? 'Error al registrar consulta';
    } finally {
      this.submitting = false;
    }
  }
  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!isNaN(id) && id > 0) {
      this.form.patchValue({ idciudadano: id }); // 👈 lo seteamos en el form
    }
    this.form.get('materias')?.valueChanges.subscribe(value => {
      const otrosCtrl = this.form.get('materiaOtros');
      if (value === 'OTROS') {
        otrosCtrl?.enable();
      } else {
        otrosCtrl?.disable();
        otrosCtrl?.reset();
      }
    });
  }
  onBack() {
    this.navergar();
  }
  navergar(){
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!isNaN(id)) {
      this.router.navigate(['/ciudadano', id]); // 🔹 Navega a /ciudadano/:id
    } else {
      this.router.navigate(['/consulta']); // fallback por si no hay id
    }
  }
}
type ControlsOf<T> = {
  [K in keyof T]: FormControl<T[K]>;
};