import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CiudadanoService } from '../services/ciudadano.service';
import { VMCiudadanoListaSimple } from '../models/ciudadano.vm';

@Component({
  selector: 'app-ciudadano-lista',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './ciudadano.lista.html',
  styleUrl: './ciudadano.lista.css'
})
export class CiudadanoLista implements OnInit {
  /* Inyección */
  private fb = inject(FormBuilder);
  private service = inject(CiudadanoService);

  /* Formulario de búsqueda */
  form = this.fb.group({
    id: [null],
    dni: [''],
    apellidoPaterno: [''],
    apellidoMaterno: [''],
    nombres: [''],
  });

  /* Estado de datos / UI visibles */
  items: VMCiudadanoListaSimple[] = [];
  total = 0;
  page = 1;
  pageSize = 9;

  loading = false;
  showOverlay = false;

  // Anti-flicker
  firstLoad = true;     // skeleton solo en primera carga
  showEmpty = false;    // "No se encontraron resultados" solo cuando !loading

  // Paginación “mostrada” (desacoplada)
  shownFrom = 0;
  shownTo = 0;
  shownPage = 1;
  shownLastPage = 1;
  shownTotal = 0;

  // PENDIENTES (se promueven al final de cada carga)
  private pendItems: VMCiudadanoListaSimple[] = [];
  private pendTotal = 0;
  private pendFrom = 0;
  private pendTo = 0;
  private pendPage = 1;
  private pendLastPage = 1;

  /* Timers / medidas */
  private reqSeq = 0;
  private overlayTimer: any;
  private emptyTimer: any;           // ya no lo usaremos, pero lo mantenemos por si lo necesitas
  private overlayShownAt = 0;
  private firstPaintStart = 0;

  private readonly overlayDelay = 180;        // ms antes de mostrar overlay (cargas posteriores)
  private readonly minOverlayMs = 220;        // ms mínimos visible si se mostró overlay
  private readonly firstSkeletonMinMs = 200;  // ms mínimos de skeleton en 1ª carga

  /* Layout helpers (alineado con CSS) */
  headerBlockPx = 96;                         // alto estimado thead + filtros
  get listMinHeight(): number {               // 96 + N*48px (ajuste fino según su tema)
    return this.headerBlockPx + this.pageSize * 48;
  }
  get skeletonRows(): number[] {
    return Array.from({ length: this.pageSize }, (_, i) => i);
  }
  get lastPage(): number {
    return this.pageSize ? Math.max(1, Math.ceil(this.total / this.pageSize)) : 1;
  }

  /** Reserva visual en ch (para paginación) */
  rangeReserveCh = 9;   // “888–888” ≈ 9ch
  totalReserveCh = 7;   // ajuste según máximos esperados

  /* Ciclo de vida */
  ngOnInit(): void {
    this.load();

    // Refiltrar dinámicamente
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

  /* Acciones */
  clear() {
    this.form.reset({
      id: null,
      dni: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      nombres: ''
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

  /* Carga con anti-flicker */
  private cancelTimers(): void {
    clearTimeout(this.overlayTimer);
    clearTimeout(this.emptyTimer);
  }

  load(): void {
    this.loading = true;
    this.cancelTimers();
    const myReq = ++this.reqSeq;

    // Ocultar estado vacío al iniciar nueva búsqueda
    this.showEmpty = false;

    // 1ª carga: sin overlay; posteriores: overlay diferido
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
    }

    const v = this.form.value;
    this.service.list({
      page: this.page,
      pageSize: this.pageSize,
      id: v.id || undefined,
      dni: v.dni || undefined,
      apellidoPaterno: v.apellidoPaterno || undefined,
      apellidoMaterno: v.apellidoMaterno || undefined,
      nombres: v.nombres || undefined,
    })
    .subscribe({
      next: (res) => {
        if (myReq !== this.reqSeq) return; // respuesta vieja → ignorar

        const incoming = res.items ?? [];
        const total = res.total ?? incoming.length;

        // NO tocar this.items aquí. Solo calcular pendientes.
        const from = incoming.length > 0 ? (this.page - 1) * this.pageSize + 1 : 0;
        const to = (this.page - 1) * this.pageSize + incoming.length;
        const last = this.pageSize ? Math.max(1, Math.ceil(total / this.pageSize)) : 1;

        this.pendItems = incoming;
        this.pendTotal = total;
        this.pendFrom = from;
        this.pendTo = to;
        this.pendPage = this.page;
        this.pendLastPage = last;

        this.finishLoadingWithOverlayMin();
      },
      error: () => {
        if (myReq !== this.reqSeq) return;

        // En error no vaciamos items (evita destello).
        // Dejamos pend* con lo ya mostrado:
        this.pendItems = this.items;
        this.pendTotal = this.total;
        this.pendFrom = this.shownFrom;
        this.pendTo = this.shownTo;
        this.pendPage = this.shownPage || this.page;
        this.pendLastPage = this.shownLastPage || this.lastPage;

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

      // Promover pendientes a “mostrados” (un solo momento)
      this.items = this.pendItems;
      this.total = this.pendTotal;
      this.shownFrom = this.pendFrom;
      this.shownTo = this.pendTo;
      this.shownPage = this.pendPage;
      this.shownLastPage = this.pendLastPage;
      this.shownTotal = this.pendTotal;

      // Decidir "vacío" SOLO ahora (y nunca durante la carga)
      this.showEmpty = this.items.length === 0;

      // Cerrar primera carga respetando el mínimo de skeleton
      if (this.firstLoad) {
        this.firstLoad = false;
      }
    };

    if (this.firstLoad) {
      const elapsed = performance.now() - this.firstPaintStart;
      const remain = Math.max(0, this.firstSkeletonMinMs - elapsed);
      setTimeout(complete, remain);   // esperar el mínimo de skeleton en 1ª carga
    } else {
      complete();                     // inmediato en cargas posteriores
    }
  }

  /* Utilidades */
  get lastPageCalc(): number {
    return this.lastPage; // alias si lo prefiere en plantillas
  }

  trackById(_index: number, item: VMCiudadanoListaSimple) {
    return item.id;
  }
}
