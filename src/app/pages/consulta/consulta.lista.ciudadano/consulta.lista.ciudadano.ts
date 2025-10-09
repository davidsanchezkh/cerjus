import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ConsultaService } from '../services/consulta.service';
import { VMConsultaListaSimple } from '../models/consulta.vm';

@Component({
  selector: 'app-consulta-lista-ciudadano',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './consulta.lista.ciudadano.html',
  styleUrl: './consulta.lista.ciudadano.css'
})
export class ConsultaListaCiudadano implements OnInit {
  /* =========================
     Inputs
     ========================= */
  @Input() set idciudadano(value: number | undefined) {
    this._idciudadano = value;
    if (value != null) this.load();
  }
  private _idciudadano?: number;

  /* =========================
     Inyección
     ========================= */
  private fb = inject(FormBuilder);
  private service = inject(ConsultaService);

  /* =========================
     Formulario
     ========================= */
  form = this.fb.group({
    id: [null],
    resumen: [''],
    fecha: [''],
    estado: [''],
  });

  /* =========================
     Estado de datos / UI
     ========================= */
  items: VMConsultaListaSimple[] = [];
  total = 0;
  page = 1;
  pageSize = 7;

  loading = false;
  showOverlay = false;

  // Anti-flicker / sincronización
  firstLoad = true;
  showEmpty = false;

  // Paginación “mostrada” (desacoplada)
  shownFrom = 0;
  shownTo = 0;
  shownPage = 1;
  shownLastPage = 1;
  shownTotal = 0;

  // Paginación pendiente (se promueve al final del ciclo anti-flicker)
  private pendFrom = 0;
  private pendTo = 0;
  private pendPage = 1;
  private pendLastPage = 1;
  private pendTotal = 0;

  /* =========================
     Timers / medidas
     ========================= */
  private reqSeq = 0;
  private overlayTimer: any;
  private emptyTimer: any;
  private overlayShownAt = 0;
  private firstPaintStart = 0;

  private readonly overlayDelay = 180;   // ms antes de mostrar overlay (cargas posteriores)
  private readonly minOverlayMs = 220;   // ms mínimos visible si llegó a mostrarse
  private readonly emptyDelay = 220;     // ms de debounce para estado vacío (no 1ª carga)
  private readonly firstSkeletonMinMs = 200; // ms mínimos de skeleton en 1ª carga

  /* =========================
     Layout helpers
     ========================= */
  headerBlockPx = 96; // alto estimado de thead + fila de filtros (ajústelo si cambia)
  get listMinHeight(): number {
    // 96px (head+filtros) + N * 48px aprox (fila), mantenga su fórmula si prefiere
    return this.headerBlockPx + this.pageSize * 48;
  }
  get skeletonRows(): number[] {
    return Array.from({ length: this.pageSize }, (_, i) => i);
  }
  get lastPage(): number {
    return this.pageSize ? Math.max(1, Math.ceil(this.total / this.pageSize)) : 1;
  }

  /* =========================
     Ciclo de vida
     ========================= */
  ngOnInit(): void {
    // Refiltrado con debounce y comparación estructural
    this.form.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      )
      .subscribe(() => {
        this.page = 1;
        this.load();
      });
  }

  /* =========================
     Acciones
     ========================= */
  clear() {
    this.form.reset({
      id: null,
      resumen: '',
      fecha: '',
      estado: '',
    });
    this.page = 1;
    this.load();
  }

  goTo(page: number) {
    if (page < 1) return;
    const last = this.lastPage;
    if (last && page > last) return;
    this.page = page;
    this.load();
  }

  /* =========================
     Carga con anti-flicker
     ========================= */
  private cancelTimers(): void {
    clearTimeout(this.overlayTimer);
    clearTimeout(this.emptyTimer);
  }

  load(): void {
    this.loading = true;
    this.cancelTimers();
    const myReq = ++this.reqSeq;

    // 1ª carga: NO overlay; posteriores: overlay diferido
    if (!this.firstLoad) {
      this.overlayTimer = setTimeout(() => {
        if (this.reqSeq === myReq) {
          this.showOverlay = true;
          this.overlayShownAt = performance.now();
        }
      }, this.overlayDelay);
    } else {
      this.firstPaintStart = performance.now();
      this.showOverlay = false;
      this.showEmpty = false;
    }

    const v = this.form.value;
    this.service.list({
      page: this.page,
      pageSize: this.pageSize,
      id: v.id || undefined,
      idciudadano: this._idciudadano,
      resumen: v.resumen || undefined,
      fecha: v.fecha ? new Date(v.fecha) : undefined,
      estado: Number(v.estado) || undefined,
    })
    .subscribe({
      next: (res) => {
        if (myReq !== this.reqSeq) return;

        const incoming = res.items ?? [];
        this.total = res.total ?? incoming.length;

        // Reemplazo en sitio para reusar nodos <tr>
        if (this.items.length) {
          this.items.splice(0, this.items.length, ...incoming);
        } else {
          this.items = incoming;
        }
        
        // Calcular paginación PENDIENTE (no mostrada aún)
        const from = incoming.length > 0 ? (this.page - 1) * this.pageSize + 1 : 0;
        const to = (this.page - 1) * this.pageSize + incoming.length;
        const last = this.pageSize ? Math.max(1, Math.ceil(this.total / this.pageSize)) : 1;

        this.pendFrom = from;
        this.pendTo = to;
        this.pendPage = this.page;
        this.pendLastPage = last;
        this.pendTotal = this.total;

        // “Vacío” con debounce SOLO después de 1ª carga
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

        this.finishLoadingWithOverlayMin();
      },
      error: (err) => {
        if (myReq !== this.reqSeq) return;
        console.error('Error al cargar la lista:', err);

        this.items = [];
        this.total = 0;

        clearTimeout(this.emptyTimer);
        if (!this.firstLoad) {
          this.emptyTimer = setTimeout(() => {
            if (this.reqSeq === myReq && this.items.length === 0) {
              this.showEmpty = true;
            }
          }, this.emptyDelay);
        }

        // Paginación “pendiente” coherente con error
        this.pendFrom = 0;
        this.pendTo = 0;
        this.pendPage = this.page;
        this.pendLastPage = this.lastPage;
        this.pendTotal = 0;

        this.finishLoadingWithOverlayMin();
      }
    });
  }

  private finishLoadingWithOverlayMin(): void {
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

      // Promover contadores “pendientes” a “mostrados”
      this.shownFrom = this.pendFrom;
      this.shownTo = this.pendTo;
      this.shownPage = this.pendPage;
      this.shownLastPage = this.pendLastPage;
      this.shownTotal = this.pendTotal;

      // Cerrar primera carga (después del skeleton mínimo)
      if (this.firstLoad) {
        this.firstLoad = false;
        if (this.items.length === 0) this.showEmpty = true;
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
}