import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormControl } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';
import { JustificacionService } from '../services/justificacion.service';

import { VMAsistenciaJustificacionItem } from '../models/justificacion.vm';
import { AJ_ESTADO_OPCIONES,AJ_TIPO_OPCIONES, AsistenciaJustificacionEstadoFiltro,AsistenciaJustificacionTipoFiltro } from '../models/justificacion.dominio';

@Component({
  selector: 'app-justificacion-lista-mis',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './justificacion.lista.mis.html',
  styleUrl: './justificacion.lista.mis.css',
})
export class JustificacionListaMis implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(JustificacionService);
  private notify = inject(NotificacionesService);
  private router = inject(Router);

  readonly estadoOpciones = AJ_ESTADO_OPCIONES;
  readonly tipoOpciones = AJ_TIPO_OPCIONES; 

  form = this.fb.group({
    desde: new FormControl<string>(''),
    hasta: new FormControl<string>(''),
    tipo: new FormControl<AsistenciaJustificacionTipoFiltro>(''),  
    estado: new FormControl<AsistenciaJustificacionEstadoFiltro>(''),
  });

  items: VMAsistenciaJustificacionItem[] = [];
  total = 0;
  page = 1;
  pageSize = 9;

  loading = false;
  showOverlay = false;

  firstLoad = true;
  showEmpty = false;

  shownFrom = 0;
  shownTo = 0;
  shownPage = 1;
  shownLastPage = 1;
  shownTotal = 0;

  private pendItems: VMAsistenciaJustificacionItem[] = [];
  private pendTotal = 0;
  private pendFrom = 0;
  private pendTo = 0;
  private pendPage = 1;
  private pendLastPage = 1;

  private reqSeq = 0;
  private overlayTimer: any;
  private overlayShownAt = 0;
  private firstPaintStart = 0;

  private readonly overlayDelay = 180;
  private readonly minOverlayMs = 220;
  private readonly firstSkeletonMinMs = 200;

  headerBlockPx = 96;
  get listMinHeight(): number {
    return this.headerBlockPx + this.pageSize * 48;
  }
  get skeletonRows(): number[] {
    return Array.from({ length: this.pageSize }, (_, i) => i);
  }
  get lastPage(): number {
    return this.pageSize ? Math.max(1, Math.ceil(this.total / this.pageSize)) : 1;
  }
  rangeReserveCh = 9;
  totalReserveCh = 7;

  ngOnInit(): void {
    this.load();

    this.form.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      )
      .subscribe(() => {
        this.page = 1;
        this.load();
      });
  }

  clear(): void {
    this.form.reset({ desde: '', hasta: '', estado: '' });
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

  private cancelTimers(): void {
    clearTimeout(this.overlayTimer);
  }

  load(): void {
    this.loading = true;
    this.cancelTimers();
    const myReq = ++this.reqSeq;

    this.showEmpty = false;

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

    this.service
      .listMis({
        page: this.page,
        pageSize: this.pageSize,
        desde: v.desde || undefined,
        hasta: v.hasta || undefined,
        tipo: (v.tipo ?? '') as any,  
        estado: (v.estado ?? '') as any,
      })
      .subscribe({
        next: (res) => {
          if (myReq !== this.reqSeq) return;

          const incoming = res.items ?? [];
          const total = res.total ?? incoming.length;

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

          this.pendItems = this.items;
          this.pendTotal = this.total;
          this.pendFrom = this.shownFrom;
          this.pendTo = this.shownTo;
          this.pendPage = this.shownPage || this.page;
          this.pendLastPage = this.shownLastPage || this.lastPage;

          this.finishLoadingWithOverlayMin();
        },
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

      this.items = this.pendItems;
      this.total = this.pendTotal;
      this.shownFrom = this.pendFrom;
      this.shownTo = this.pendTo;
      this.shownPage = this.pendPage;
      this.shownLastPage = this.pendLastPage;
      this.shownTotal = this.pendTotal;

      this.showEmpty = this.items.length === 0;

      if (this.firstLoad) this.firstLoad = false;
    };

    if (this.firstLoad) {
      const elapsed = performance.now() - this.firstPaintStart;
      const remain = Math.max(0, this.firstSkeletonMinMs - elapsed);
      setTimeout(complete, remain);
    } else {
      complete();
    }
  }

  estadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'bg-warning text-dark';
      case 'APROBADA': return 'bg-success';
      case 'RECHAZADA': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  trackById(_i: number, item: VMAsistenciaJustificacionItem) {
    return item.aj_ID;
  }

  async irRegistrar() {
    // Ajuste la ruta si la suya es distinta
    this.router.navigate(['/justificacion/registrar']);
  }
}
