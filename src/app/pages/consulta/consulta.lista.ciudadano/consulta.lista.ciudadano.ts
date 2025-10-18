import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ConsultaService } from '../services/consulta.service';
import { VMConsultaListaSimple } from '../models/consulta.vm';
import { ESTADO_CONSULTA_OPCIONES, EstadoConsulta } from '../models/consulta.dominio';
@Component({
  selector: 'app-consulta-lista-ciudadano',
  standalone: true,
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
    if (value != null) this.load(); // dispara carga inicial cuando llega el id
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
  estadoOpciones = ESTADO_CONSULTA_OPCIONES;
  form = this.fb.group({
    id: [null],
    resumen: [''],
    fecha: [''],  // string yyyy-MM-dd
    estado: ['' as '' | EstadoConsulta], // string/number libre
  });

  /* =========================
     Estado de datos / UI visibles
     ========================= */
  items: VMConsultaListaSimple[] = [];
  total = 0;
  page = 1;
  pageSize = 7;

  loading = false;
  showOverlay = false;

  // Anti-flicker
  firstLoad = true;   // skeleton solo en 1ª carga
  showEmpty = false;  // solo cuando !loading

  // Paginación “mostrada” (desacoplada)
  shownFrom = 0;
  shownTo = 0;
  shownPage = 1;
  shownLastPage = 1;
  shownTotal = 0;

  // Pendientes (se promueven al finalizar cada carga)
  private pendItems: VMConsultaListaSimple[] = [];
  private pendTotal = 0;
  private pendFrom = 0;
  private pendTo = 0;
  private pendPage = 1;
  private pendLastPage = 1;

  /* =========================
     Timers / medidas
     ========================= */
  private reqSeq = 0;
  private overlayTimer: any;
  private overlayShownAt = 0;
  private firstPaintStart = 0;

  private readonly overlayDelay = 180;        // ms antes de mostrar overlay (cargas posteriores)
  private readonly minOverlayMs = 220;        // ms mínimos visible si se mostró overlay
  private readonly firstSkeletonMinMs = 200;  // ms mínimos de skeleton en 1ª carga

  /* =========================
     Layout helpers
     ========================= */
  headerBlockPx = 96; // alto estimado de thead + fila de filtros
  get listMinHeight(): number {
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
    // Si el id llega después por @Input, load() ya lo dispara el setter
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
     Carga con anti-flicker (sin parpadeos)
     ========================= */
  private cancelTimers(): void {
    clearTimeout(this.overlayTimer);
  }

  load(): void {
    if (this._idciudadano == null) return; // aún no hay contexto

    this.loading = true;
    this.cancelTimers();
    const myReq = ++this.reqSeq;

    // Oculta "vacío" al iniciar nueva búsqueda, no toques items para no parpadear
    this.showEmpty = false;

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
    }

    const v = this.form.value;

    const estado =
      v.estado === '' || v.estado == null
        ? undefined
        : Number(v.estado) as EstadoConsulta;
        
    this.service.list({
      page: this.page,
      pageSize: this.pageSize,
      id: v.id || undefined,
      idciudadano: this._idciudadano,
      resumen: v.resumen || undefined,
      fecha: v.fecha ? new Date(v.fecha) : undefined,
      estado: estado,
    })
    .subscribe({
      next: (res) => {
        if (myReq !== this.reqSeq) return; // respuesta vieja → ignorar

        const incoming = res.items ?? [];
        const total = res.total ?? incoming.length;

        // No tocar items ahora. Calcula pendientes.
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

        // En error, conserva la pantalla tal cual (sin vaciar)
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

      // Promover pendientes a mostrados (un único momento)
      this.items = this.pendItems;
      this.total = this.pendTotal;
      this.shownFrom = this.pendFrom;
      this.shownTo = this.pendTo;
      this.shownPage = this.pendPage;
      this.shownLastPage = this.pendLastPage;
      this.shownTotal = this.pendTotal;

      // "Vacío" solo al finalizar la carga
      this.showEmpty = this.items.length === 0;

      // Cerrar 1ª carga (respetando mínimo de skeleton)
      if (this.firstLoad) {
        this.firstLoad = false;
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

  /* Utilidades */
  trackById(_index: number, item: VMConsultaListaSimple) {
    return item.id;
  }
}
