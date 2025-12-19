import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AsistenciaService } from '../services/asistencia.service';
import { VMAsistenciaListaSimple } from '../models/asistencia.vm';
import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-asistencia-lista',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './asistencia.lista.html',
  styleUrl: './asistencia.lista.css'
})
export class AsistenciaLista implements OnInit {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private service = inject(AsistenciaService);
  private notify = inject(NotificacionesService);

  // Form de filtros (si luego agregas campos, se activará el valueChanges)
  form = this.fb.group({});

  // Estado datos/UI
  items: VMAsistenciaListaSimple[] = [];
  total = 0;
  page = 1;
  pageSize = 11;

  loading = false;
  showOverlay = false;
  firstLoad = true;
  showEmpty = false;

  // Paginación mostrada (desacoplada)
  shownFrom = 0;
  shownTo = 0;
  shownPage = 1;
  shownLastPage = 1;
  shownTotal = 0;

  // Pendientes (se promueven al final)
  private pendFrom = 0;
  private pendTo = 0;
  private pendPage = 1;
  private pendLastPage = 1;
  private pendTotal = 0;

  // Timers / control
  private reqSeq = 0;
  private overlayTimer: any;
  private emptyTimer: any;
  private overlayShownAt = 0;
  private firstPaintStart = 0;

  private readonly overlayDelay = 180;
  private readonly minOverlayMs = 220;
  private readonly emptyDelay = 220;
  private readonly firstSkeletonMinMs = 200;

  // Layout helpers
  headerBlockPx = 96;
  get listMinHeight(): number { return this.headerBlockPx + 9 * 48; }
  get skeletonRows(): number[] { return Array.from({ length: this.pageSize }, (_, i) => i); }
  get lastPage(): number { return this.pageSize ? Math.max(1, Math.ceil(this.total / this.pageSize)) : 1; }

  // Paginación (reserva visual en ch)
  rangeReserveCh = 9;
  totalReserveCh = 7;

  ngOnInit(): void {
    this.load();

    // Si en el futuro agregas filtros, quita el comentario a this.load()
    this.form.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      )
      .subscribe(() => {
        this.page = 1;
        // this.load();
      });
  }

  clear() {
    this.form.reset({});
    this.page = 1;
    // this.load();
  }

  goTo(page: number) {
    if (page < 1) return;
    const last = this.lastPage;
    if (last && page > last) return;
    this.page = page;
    this.load();
  }

  private cancelTimers(): void {
    clearTimeout(this.overlayTimer);
    clearTimeout(this.emptyTimer);
  }

  load(): void {
    this.loading = true;
    this.cancelTimers();
    const myReq = ++this.reqSeq;

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

    this.service.list({ page: this.page, pageSize: this.pageSize }).subscribe({
      next: (res) => {
        if (myReq !== this.reqSeq) return;

        const incoming = res.items ?? [];
        this.total = res.total ?? incoming.length;

        if (this.items.length) {
          this.items.splice(0, this.items.length, ...incoming);
        } else {
          this.items = incoming;
        }

        const from = incoming.length > 0 ? (this.page - 1) * this.pageSize + 1 : 0;
        const to = (this.page - 1) * this.pageSize + incoming.length;
        const last = this.pageSize ? Math.max(1, Math.ceil(this.total / this.pageSize)) : 1;

        this.pendFrom = from;
        this.pendTo = to;
        this.pendPage = this.page;
        this.pendLastPage = last;
        this.pendTotal = this.total;

        clearTimeout(this.emptyTimer);
        if (!this.firstLoad) {
          this.showEmpty = incoming.length === 0;
        }

        this.finishLoadingWithOverlayMin();
      },
      error: () => {
        if (myReq !== this.reqSeq) return;

        // Mantén la pantalla; los mensajes los muestra el interceptor
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

      this.shownFrom = this.pendFrom;
      this.shownTo = this.pendTo;
      this.shownPage = this.pendPage;
      this.shownLastPage = this.pendLastPage;
      this.shownTotal = this.pendTotal;

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

  // === Marcaciones (solo happy path; errores los muestra el interceptor) ===
  marcando = false;

  marcarEntrada(): void {
    if (this.marcando) return;
    this.marcando = true;

    this.service.marcarEntrada().subscribe({
      next: async () => {
        this.marcando = false;
        await this.notify.ok({
          variant: 'success',
          title: 'Marcación registrada',
          message: 'Se registró la ENTRADA correctamente.',
          primaryText: 'Aceptar'
        });
        this.load();
      },
      error: () => {
        this.marcando = false; // el interceptor ya mostró el diálogo de error
      }
    });
  }

  marcarSalida(): void {
    if (this.marcando) return;
    this.marcando = true;

    this.service.marcarSalida().subscribe({
      next: async () => {
        this.marcando = false;
        await this.notify.ok({
          variant: 'success',
          title: 'Marcación registrada',
          message: 'Se registró la SALIDA correctamente.',
          primaryText: 'Aceptar'
        });
        this.load();
      },
      error: () => {
        this.marcando = false; // el interceptor ya mostró el diálogo de error
      }
    });
  }

  get lastPageCalc(): number {
    return this.lastPage;
  }
  goJustificaciones() {
    this.router.navigate(['/justificacion/mis']);
  }
}
