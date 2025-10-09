import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder,Validators,AbstractControl,ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import {VMCiudadanoCreate} from '../models/ciudadano.vm'
import { CiudadanoService } from '../services/ciudadano.service';
import { FormControl } from '@angular/forms';

type Supo = 'AMIGO'|'VECINO'|'VOLANTE'|'OTROS'|'ERROR';

@Component({
  selector: 'app-ciudadano-registrar',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './ciudadano.registrar.html',
  styleUrl: './ciudadano.registrar.css'
})export class CiudadanoRegistar  {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private service = inject(CiudadanoService);

  submitting = false;
  errorMessage = '';

  form = this.fb.group<ControlsOf<VMCiudadanoCreate>>({
    nombres: new FormControl('', { nonNullable: true }),
    apellidoPaterno: new FormControl('', { nonNullable: true }),
    apellidoMaterno: new FormControl('', { nonNullable: true }),
    dni: new FormControl('', { nonNullable: true }),
    domicilio: new FormControl('', { nonNullable: true }),
    ocupacion: new FormControl('', { nonNullable: true }),
    fechaNacimiento: new FormControl('', { nonNullable: true }),
    hijos: new FormControl(0, { nonNullable: true }),
    telefono: new FormControl('', { nonNullable: true }),
    correoE: new FormControl('', { nonNullable: true }),

    supo: new FormControl<Supo>('ERROR', { nonNullable: true }),
    supoOtrosDetalle: new FormControl('', { nonNullable: true })
  });

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    try {
      const vm: VMCiudadanoCreate = this.form.getRawValue();
      const createdId = await this.service.create(vm);

      this.router.navigate(['/ciudadano', createdId]);
    } catch (err: any) {
      console.error("Error al guardar:", err);

      if (err.error) {
        console.error("Detalles backend:", err.error);
      }
      if (Array.isArray(err.error?.message)) {
        err.error.message.forEach((e: any) => {
          console.warn(`❌ ${e.property} (${e.value}) → ${JSON.stringify(e.constraints)}`);
        });
      }
    } finally {
      this.submitting = false;
    }
  }

  onBack() {
    this.router.navigateByUrl('/ciudadano');
  }
  
}
type ControlsOf<T> = {
  [K in keyof T]: FormControl<T[K]>;
};