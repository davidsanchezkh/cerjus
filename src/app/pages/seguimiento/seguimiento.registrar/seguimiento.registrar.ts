import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder,Validators,AbstractControl,ValidationErrors } from '@angular/forms';
import { Router,ActivatedRoute } from '@angular/router';
import { VMSeguimientoCreate} from '../models/seguimiento.vm'
import { SeguimientoService} from '../services/seguimiento.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-seguimiento-registrar',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './seguimiento.registrar.html',
  styleUrl: './seguimiento.registrar.css'
})export class SeguimientoRegistar  {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private service = inject(SeguimientoService);

  submitting = false;
  errorMessage = '';

  form = this.fb.group<ControlsOf<VMSeguimientoCreate>>({
    idconsulta: new FormControl(0, { nonNullable: true }),
    cuerposeguimiento: new FormControl('', { nonNullable: true }),
  });

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    try {
      const vm: VMSeguimientoCreate = this.form.getRawValue();
      const createdId = await this.service.create(vm);
      
      this.navergar();
      
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
  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!isNaN(id) && id > 0) {
      this.form.patchValue({ idconsulta: id }); // 👈 lo seteamos en el form
    }
  }
  onBack() {
    this.navergar();
  }
  navergar(){
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!isNaN(id)) {
      this.router.navigate(['/consulta', id]); // 🔹 Navega a /consulta/:id
    } else {
      this.router.navigate(['/seguimiento']); // fallback por si no hay id
    }
  }
}
type ControlsOf<T> = {
  [K in keyof T]: FormControl<T[K]>;
};