import { Component, OnInit, inject,Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder,FormGroup,FormArray,FormControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SeguimientoService } from '../services/seguimiento.service';
import { VMSeguimientoListaSimple } from '../models/seguimiento.vm';

@Component({
  selector: 'app-seguimiento-lista-consulta',
  imports: [CommonModule,ReactiveFormsModule,RouterLink],
  templateUrl: './seguimiento.lista.consulta.html',
  styleUrl: './seguimiento.lista.consulta.css'
})
export class SeguimientoListaConsulta implements OnInit {
  /* =========================
     Inputs
     ========================= */
  @Input() set idconsulta(value: number | undefined) {
    this._idconsulta = value;
    if (value != null) this.load();
  }

  /* =========================
     Inyección de dependencias (alfabético)
     ========================= */
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(SeguimientoService);

  /* =========================
     Campos privados (alfabético)
     ========================= */
  private _idconsulta?: number;
  private emptyTimer: any;
  private firstPaintStart = 0;
  private overlayShownAt = 0;
  private overlayTimer: any;
  private reqSeq = 0;

  /* =========================
     Constantes / configuración (alfabético)
     ========================= */
  // Anti-parpadeo
  private readonly emptyDelay = 220;     // ms antes de mostrar “vacío” estable
  private readonly minOverlayMs = 220;   // ms mínimo visible si se mostró overlay
  private readonly overlayDelay = 180;   // ms para mostrar overlay diferido
  // Primera carga
  private readonly firstSkeletonMinMs = 200; // ms mínimo de skeleton en 1ª carga
  // Alturas (mantener en sync con CSS)
  readonly basePaddingPx = 12;
  readonly rowGapPx = 8;
  readonly rowSlotPx = 140;

  /** Paginación mostrada (desacoplada para evitar flash) */
  shownFrom = 0;
  shownTo = 0;
  shownPage = 1;
  shownLastPage = 1;
  shownTotal = 0;

  /** Paginación pendiente (se promueve al finalizar el anti-flicker) */
  private pendFrom = 0;
  private pendTo = 0;
  private pendPage = 1;
  private pendLastPage = 1;
  private pendTotal = 0;
  /* =========================
     Estado público (alfabético)
     ========================= */
  firstLoad = true;
  form = this.fb.group({
    cuerposeguimiento: [''],
    estado: [''],
    fecha: [''],
    id: [null],
    rows: this.fb.array<FormGroup>([]),
  });
  items: VMSeguimientoListaSimple[] = [];
  loading = false;
  page = 1;
  pageSize = 3;
  showEmpty = false;
  showOverlay = false;
  total = 0;

  /* =========================
     Getters (alfabético)
     ========================= */
  get lastPage(): number {
    return this.pageSize ? Math.max(1, Math.ceil(this.total / this.pageSize)) : 1;
  }

  get listMinHeight(): number {
    // Altura base + N * alto_tarjeta + (N - 1) * gap
    return (
      this.basePaddingPx +
      this.pageSize * this.rowSlotPx +
      Math.max(0, this.pageSize - 1) * this.rowGapPx
    );
  }

  get rows(): FormArray<FormGroup> {
    return this.form.get('rows') as FormArray<FormGroup>;
  }

  get skeletons(): number[] {
    return Array.from({ length: this.pageSize }, (_, i) => i);
  }

  /* =========================
     Ciclo de vida (alfabético)
     ========================= */
  ngOnInit(): void {
    // (espacio para refiltrado con valueChanges si lo necesita)
  }

  /* =========================
     Métodos públicos (alfabético)
     ========================= */
  clear(): void {
    this.form.reset({
      cuerposeguimiento: '',
      estado: '',
      fecha: '',
      id: null,
    });
    this.page = 1;
    this.load();
  }

  goTo(page: number): void {
    if (page < 1) return;
    const last = this.lastPage;
    if (last && page > last) return;
    this.page = page;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.cancelTimers();

    const myReq = ++this.reqSeq;

    // 1ª carga: sin overlay (solo skeleton); posteriores: overlay diferido
    if (!this.firstLoad) {
      this.overlayTimer = setTimeout(() => {
        if (this.reqSeq === myReq) {
          this.showOverlay = true;
          this.overlayShownAt = performance.now();
        }
      }, this.overlayDelay);
    } else {
      this.firstPaintStart = performance.now();
      this.showOverlay = false; // sin overlay en 1ª carga
      this.showEmpty = false;   // tampoco mostrar vacío en 1ª carga
    }

    const v = this.form.value;
    this.service
      .list({
        page: this.page,
        pageSize: this.pageSize,
        cuerposeguimiento: v.cuerposeguimiento || undefined,
        fechaCreadoPor: v.fecha ? new Date(v.fecha) : undefined,
        id: v.id || undefined,
        idconsulta: this._idconsulta,
      })
      .subscribe({
        next: (res) => {
          if (myReq !== this.reqSeq) return;

          const incoming = res.items ?? [];
          this.total = res.total ?? incoming.length;

          // Reemplazo en sitio para reusar nodos
          if (this.items.length) {
            this.items.splice(0, this.items.length, ...incoming);
          } else {
            this.items = incoming;
          }

          // Sincronizar FormArray con items visibles
          this.rebuildRows();

          // === Calcular paginación PENDIENTE (no mostrada aún) ===
          const from = incoming.length > 0 ? (this.page - 1) * this.pageSize + 1 : 0;
          const to = (this.page - 1) * this.pageSize + incoming.length;
          const last = this.pageSize ? Math.max(1, Math.ceil(this.total / this.pageSize)) : 1;

          this.pendFrom = from;
          this.pendTo = to;
          this.pendPage = this.page;
          this.pendLastPage = last;
          this.pendTotal = this.total;

          // “Vacío” con debounce SOLO después de la 1ª carga
          clearTimeout(this.emptyTimer);
          if (!this.firstLoad) {
            if (incoming.length === 0) {
              this.emptyTimer = setTimeout(() => {
                if (this.reqSeq === myReq && this.items.length === 0) {
                  this.showEmpty = true;
                }
              }, this.emptyDelay);
            } else {
              this.showEmpty = false;
            }
          }

          this.finishLoadingWithOverlayMin(myReq);
        },
        error: (err) => {
          if (myReq !== this.reqSeq) return;

          console.error('Error al cargar la lista:', err);
          if (err?.error) console.error('Detalles backend:', err.error);
          if (Array.isArray(err?.error?.message)) {
            err.error.message.forEach((e: any) => {
              console.warn(`❌ ${e.property} (${e.value}) → ${JSON.stringify(e.constraints)}`);
            });
          }

          // Reset de datos y formulario de filas
          this.items = [];
          this.total = 0;
          this.rows.clear();

          clearTimeout(this.emptyTimer);
          if (!this.firstLoad) {
            this.emptyTimer = setTimeout(() => {
              if (this.reqSeq === myReq && this.items.length === 0) {
                this.showEmpty = true;
              }
            }, this.emptyDelay);
          }

          this.finishLoadingWithOverlayMin(myReq);
        },
      });
  }

  onRowChange(i: number): void {
    const formValue = this.rows.at(i).value;
    const id = this.items[i]?.id;
    // Ejemplo:
    // this.service.update(id, formValue).subscribe(...)
  }

  trackById(_index: number, item: VMSeguimientoListaSimple): number {
    return item.id;
  }

  /* =========================
     Métodos privados (alfabético)
     ========================= */
  private cancelTimers(): void {
    clearTimeout(this.overlayTimer);
    clearTimeout(this.emptyTimer);
  }

  private finishLoadingWithOverlayMin(myReq: number): void {
    const complete = () => {
      this.loading = false;
      clearTimeout(this.overlayTimer);

      if (this.showOverlay) {
        const elapsed = performance.now() - this.overlayShownAt;
        const remain = Math.max(0, this.minOverlayMs - elapsed);
        setTimeout(() => (this.showOverlay = false), remain);
      } else {
        this.showOverlay = false;
      }

      // === Aquí promovemos los valores pendientes a los "mostrados" ===
      this.shownFrom = this.pendFrom;
      this.shownTo = this.pendTo;
      this.shownPage = this.pendPage;
      this.shownLastPage = this.pendLastPage;
      this.shownTotal = this.pendTotal;

      // Cerrar primera carga tras respetar el mínimo del skeleton
      if (this.firstLoad) {
        this.firstLoad = false;
        if (this.items.length === 0) {
          this.showEmpty = true;
        }
      }
    };

    if (this.firstLoad) {
      const elapsed = performance.now() - this.firstPaintStart;
      const remain = Math.max(0, this.firstSkeletonMinMs - elapsed);
      setTimeout(complete, remain);
    } else {
      complete();
    }
  }

  private rebuildRows(): void {
    this.rows.clear();
    for (const it of this.items) {
      this.rows.push(
        this.fb.group({
          cuerposeguimiento: new FormControl<string>(it.cuerposeguimiento ?? ''),
        }),
      );
    }
  }
}