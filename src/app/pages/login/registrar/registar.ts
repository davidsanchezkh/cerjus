import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder,Validators,AbstractControl,ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { VMLoginCreate} from '../models/login.vm'
import { LoginService } from '../services/login.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-login-registrar',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './registrar.html',
  styleUrl: './registrar.css'
})export class Registar  {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private service = inject(LoginService);

  submitting = false;
  errorMessage = '';

  form = this.fb.group<ControlsOf<VMLoginCreate>>({
    nombres: new FormControl('', { nonNullable: true }),
    apellidoPaterno: new FormControl('', { nonNullable: true }),
    apellidoMaterno: new FormControl('', { nonNullable: true }),
    dni: new FormControl('', { nonNullable: true }),

    telefono: new FormControl('', { nonNullable: true }),
    correoE: new FormControl('', { nonNullable: true }),

    contrasena: new FormControl('', { nonNullable: true }),
  });

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    try {
      const vm: VMLoginCreate = this.form.getRawValue();
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
    this.router.navigateByUrl('/login');
  }
  
}
type ControlsOf<T> = {
  [K in keyof T]: FormControl<T[K]>;
};