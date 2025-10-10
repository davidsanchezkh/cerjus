import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AsistenciaService } from '../services/asistencia.service';
import { VMAsistenciaListaSimple } from '../models/asistencia.vm';

@Component({
  selector: 'app-asistencia-lista',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './asistencia.lista.html',
  styleUrl: './asistencia.lista.css'
})
export class AsistenciaLista implements OnInit {
  /* Inyección */
  private fb = inject(FormBuilder);
  private service = inject(AsistenciaService);

  /* Formulario de búsqueda */
  form = this.fb.group({
    
  });

  /* Estado de datos / UI */
  items: VMAsistenciaListaSimple[] = [];
  total = 0;
  page = 1;
  pageSize = 11;

  loading = false;
  showOverlay = false;

  // Anti-flicker
  firstLoad = true;
  showEmpty = false;

  // Paginación “mostrada” (desacoplada)
  shownFrom = 0;
  shownTo = 0;
  shownPage = 1;
  shownLastPage = 1;
  shownTotal = 0;

  // Paginación PENDIENTE (se promueve al final del ciclo anti-flicker)
  private pendFrom = 0;
  private pendTo = 0;
  private pendPage = 1;
  private pendLastPage = 1;
  private pendTotal = 0;

  /* Timers / medidas */
  private reqSeq = 0;
  private overlayTimer: any;
  private emptyTimer: any;
  private overlayShownAt = 0;
  private firstPaintStart = 0;

  private readonly overlayDelay = 180;        // ms antes de mostrar overlay (cargas posteriores)
  private readonly minOverlayMs = 220;        // ms mínimos visible si se mostró overlay
  private readonly emptyDelay = 220;          // ms de debounce para “vacío” (no en 1ª carga)
  private readonly firstSkeletonMinMs = 200;  // ms mínimos de skeleton en 1ª carga

  /* Layout helpers (alineado con CSS) */
  headerBlockPx = 96;                         // alto estimado thead + filtros
  get listMinHeight(): number {               // 96 + N*48px (ajuste fino según su tema)
    return this.headerBlockPx + 9 * 48;
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
        //this.load();
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
    //this.load();
  }

  goTo(page: number) {
    if (page < 1) return;
    const last = this.lastPage;
    if (last && page > last) return;
    this.page = page;
    //this.load();
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
      this.showEmpty = false;
    }

    const v = this.form.value;
    this.service.list({
      page: this.page,
      pageSize: this.pageSize,
    })
    .subscribe({
      next: (res) => {
        if (myReq !== this.reqSeq) return;

        const incoming = res.items ?? [];
        this.total = res.total ?? incoming.length;

        // Reemplazo en sitio para reutilizar nodos <tr>
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
      error: () => {
        if (myReq !== this.reqSeq) return;

        // Reset coherente
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

        // Paginación pendiente coherente al error
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

      // Cerrar primera carga respetando el mínimo de skeleton
      if (this.firstLoad) {
        this.firstLoad = false;
        if (this.items.length === 0) this.showEmpty = true;
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
  
  marcando = false;
  marcarEntrada(): void {
    if (this.marcando) return;
    this.marcando = true;
    this.service.marcarEntrada().subscribe({
      next: () => {
        this.marcando = false;
        this.load(); // refresca la tabla
      },
      error: () => {
        this.marcando = false;
        alert('No se pudo marcar la entrada.');
      }
    });
  }

  marcarSalida(): void {
    if (this.marcando) return;
    this.marcando = true;
    this.service.marcarSalida().subscribe({
      next: () => {
        this.marcando = false;
        this.load(); // refresca la tabla
      },
      error: () => {
        this.marcando = false;
        alert('No se pudo marcar la salida.');
      }
    });
  }
  /*trackById(_index: number, item: VMCiudadanoListaSimple) {
    return item.id;
  }*/
}