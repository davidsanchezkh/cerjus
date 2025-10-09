import { Component, OnInit,inject,Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder,Validators,AbstractControl,ValidationErrors } from '@angular/forms';
import {VMConsultaDetalleSimple,VMConsultaUpdate,VMConsultaUpdateForm} from '../models/consulta.vm'
import { ActivatedRoute,Router  } from '@angular/router';
import { ConsultaService } from '../services/consulta.service';
import { FormControl } from '@angular/forms';
import {MapDetalleToUpdate} from '../mappers/consulta.mapper';
import { SeguimientoListaConsulta } from '../../seguimiento/seguimiento.lista.consulta/seguimiento.lista.consulta';

@Component({
  selector: 'app-consulta-detalle',
  imports: [CommonModule,ReactiveFormsModule,SeguimientoListaConsulta],
  templateUrl: './consulta.detalle.html',
  styleUrl: './consulta.detalle.css'
})export class ConsultaDetalle implements OnInit{

  idconsulta!: number;

  constructor(private router: Router) {}
  private route = inject(ActivatedRoute);
  private service = inject(ConsultaService);
  private fb = inject(FormBuilder);
  isEditing=false;
  // controla el colapso del panel
  open = false;
  open2 = true;
  originalData!: VMConsultaUpdate;
  //primera carga

  form = this.fb.group<ControlsOf<VMConsultaUpdateForm>>({
    resumen: new FormControl('', { nonNullable: true }),
    hechos: new FormControl('', { nonNullable: true }),
    materia: new FormControl('', { nonNullable: true }),
    absolucion: new FormControl('', { nonNullable: true }),
    estado: new FormControl(0, { nonNullable: true }),
  });

  ngOnInit(): void {
    
    this.form.disable();
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.service.getById(id).subscribe({
        next: (data) => {
        this.form.patchValue(data);
        this.originalData =  MapDetalleToUpdate(data);
        this.idconsulta = id;
      },
        error: (err) => console.error('Error al cargar ciudadano:', err)
      });
    }
  }
  onEdit(event: Event): void {
    event.stopPropagation();
    this.isEditing = true;
    this.open = true;
    this.form.enable(); 
  }
  onCancel() {
    this.form.reset(this.originalData);
    this.isEditing = false;
    this.form.disable();
  }
  getChangedFields(): string[] {
    const changes: string[] = [];
    type FormValue = typeof this.form.value;

    for (const key in this.form.value) {
      const typedKey = key as keyof FormValue;
      if (this.form.value[typedKey] !== this.originalData[typedKey]) {
        changes.push(key);
      }
    }
    return changes;
  }
  onSave() {
    if (!this.form.valid) return;
    const current = this.form.value;
    const changes: Partial<typeof current> = {};

    for (const key of Object.keys(current) as (keyof typeof current)[]) {
      if (current[key] !== this.originalData[key]) {
        changes[key] = current[key] as any;
      }
    }
    if (Object.keys(changes).length === 0) {
      console.log("No hay cambios para guardar");
      return;
    }
    // asegurar id presente
    const id = this.originalData.id;
    if (id === undefined || id === null) {
      console.error("El id es obligatorio para actualizar");
      return;
    }

    // llamar al service pasando id por separado

    this.service.update(id, changes)
    .then((ciudadanoId: number) => {
      console.log("Guardado con éxito, id:", ciudadanoId);
       // normalizar mayúsculas en cambios antes de actualizar originalData
      const normalizedChanges = Object.fromEntries(
        Object.entries(changes).map(([k, v]) => [
          k,
          typeof v === "string" ? v.toUpperCase() : v
        ])
      );
      // actualizar originalData (mantener id y mezclar cambios)
      this.originalData = { ...this.originalData, ...(normalizedChanges as any) };
      this.form.patchValue(this.originalData); // opcional: sincronizar formulario
      this.isEditing = false;
    })
    .catch((err) => {
      console.error("Error al guardar:", err);

      if (err.error) {
        console.error("Detalles backend:", err.error);
      }
      if (Array.isArray(err.error?.message)) {
        err.error.message.forEach((e: any) => {
          console.warn(`❌ ${e.property} (${e.value}) → ${JSON.stringify(e.constraints)}`);
        });
      }
    });
  }
  
  gotoSeguimiento(){
    this.router.navigate(['/seguimiento/registrar', this.idconsulta]);
  }

}
type ControlsOf<T> = {
  [K in keyof T]: FormControl<T[K]>;
};
