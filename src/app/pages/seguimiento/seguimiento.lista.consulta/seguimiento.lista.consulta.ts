import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { SeguimientoService } from '../services/seguimiento.service';
import { VMSeguimientoListaSimple } from '../models/seguimiento.vm';
// Notificaciones centralizadas (mismo servicio que en consulta.detalle)
import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';

type RowValue = { cuerposeguimiento: string };
type RowPatch = Partial<RowValue>;

@Component({
  selector: 'app-seguimiento-lista-consulta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
     Inyección
     ========================= */
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(SeguimientoService);
  private readonly notify = inject(NotificacionesService);

  /* =========================
     Privados
     ========================= */
  private _idconsulta?: number;
  private emptyTimer: any;
  private firstPaintStart = 0;
  private overlayShownAt = 0;
  private overlayTimer: any;
  private reqSeq = 0;

  // Estado de edición por fila (clave = id del seguimiento)
  private editingIds = new Set<number>();
  private originalById = new Map<number, RowValue>();

  /* =========================
     Config anti-flicker
     ========================= */
  private readonly emptyDelay = 220;
  private readonly minOverlayMs = 220;
  private readonly overlayDelay = 180;
  private readonly firstSkeletonMinMs = 200;

  /* =========================
     Layout
     ========================= */
  readonly basePaddingPx = 12;
  readonly rowGapPx = 8;
  readonly rowSlotPx = 140;

  /* =========================
     Estado público
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
  total = 0;
  showEmpty = false;
  showOverlay = false;

  /* Paginación mostrada (desacoplada) */
  shownFrom = 0;
  shownTo = 0;
  shownPage = 1;
  shownLastPage = 1;
  shownTotal = 0;

  /* Paginación pendiente */
  private pendFrom = 0;
  private pendTo = 0;
  private pendPage = 1;
  private pendLastPage = 1;
  private pendTotal = 0;

  /* =========================
     Getters
     ========================= */
  get lastPage(): number {
    return this.pageSize ? Math.max(1, Math.ceil(this.total / this.pageSize)) : 1;
  }
  get listMinHeight(): number {
    return this.basePaddingPx + this.pageSize * this.rowSlotPx + Math.max(0, this.pageSize - 1) * this.rowGapPx;
  }
  get rows(): FormArray<FormGroup> {
    return this.form.get('rows') as FormArray<FormGroup>;
  }
  get skeletons(): number[] {
    return Array.from({ length: this.pageSize }, (_, i) => i);
  }

  /* =========================
     Ciclo de vida
     ========================= */
  ngOnInit(): void {
    // (si agregas refiltrado por valueChanges, bienvenido)
  }

  /* =========================
     Acciones de lista
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

        // Reusar array para evitar parpadeo
        if (this.items.length) {
          this.items.splice(0, this.items.length, ...incoming);
        } else {
          this.items = incoming;
        }

        // Reconstruir filas manteniendo estado de edición por id
        this.rebuildRows();

        // Calcular paginación pendiente
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
          if (incoming.length === 0) {
            this.emptyTimer = setTimeout(() => {
              if (this.reqSeq === myReq && this.items.length === 0) this.showEmpty = true;
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
        if (err?.error) console.error('Detalles backend:', err.error);

        this.items = [];
        this.total = 0;
        this.rows.clear();

        clearTimeout(this.emptyTimer);
        if (!this.firstLoad) {
          this.emptyTimer = setTimeout(() => {
            if (this.reqSeq === myReq && this.items.length === 0) this.showEmpty = true;
          }, this.emptyDelay);
        }

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

      // Promover paginación mostrada
      this.shownFrom = this.pendFrom;
      this.shownTo = this.pendTo;
      this.shownPage = this.pendPage;
      this.shownLastPage = this.pendLastPage;
      this.shownTotal = this.pendTotal;

      // Cerrar primera carga
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

  private rebuildRows(): void {
    // Mantén originales para ids visibles; limpia estados de ids que desaparecen
    const visibleIds = new Set(this.items.map(x => x.id));
    for (const id of Array.from(this.originalById.keys())) {
      if (!visibleIds.has(id)) {
        this.originalById.delete(id);
        this.editingIds.delete(id);
      }
    }

    this.rows.clear();
    for (const it of this.items) {
      const g = this.fb.group({
        cuerposeguimiento: new FormControl<string>(it.cuerposeguimiento ?? ''),
      });

      // Guarda original si no existe aún
      if (!this.originalById.has(it.id)) {
        this.originalById.set(it.id, { cuerposeguimiento: it.cuerposeguimiento ?? '' });
      }

      // Aplica estado (habilitado si está en edición)
      if (this.editingIds.has(it.id)) g.enable({ emitEvent: false });
      else g.disable({ emitEvent: false });

      this.rows.push(g);
    }
  }

  /* =========================
     Edición por fila (estilo consulta.detalle)
     ========================= */
  isEditingRow(id: number): boolean {
    return this.editingIds.has(id);
  }

  onEdit(i: number, ev?: Event): void {
    ev?.stopPropagation();
    const id = this.items[i]?.id;
    if (id == null) return;

    this.editingIds.add(id);
    this.rows.at(i).enable({ emitEvent: false });

    // Asegura snapshot original (por si viene de una recarga sin edición previa)
    if (!this.originalById.has(id)) {
      const val = this.rows.at(i).getRawValue() as RowValue;
      this.originalById.set(id, { ...val });
    }
  }

  private rowHasUnsavedChanges(i: number): boolean {
    const id = this.items[i]?.id;
    if (id == null) return false;
    const orig = this.originalById.get(id) ?? { cuerposeguimiento: '' };
    const cur = this.rows.at(i).getRawValue() as RowValue;
    return (cur.cuerposeguimiento ?? '') !== (orig.cuerposeguimiento ?? '');
  }

  async onCancel(i: number): Promise<void> {
    const id = this.items[i]?.id;
    if (id == null) return;

    if (this.rowHasUnsavedChanges(i)) {
      const ok = await this.notify.confirm({
        variant: 'warning',
        title: 'Descartar cambios',
        message: 'Tienes cambios sin guardar. ¿Deseas descartarlos?',
        confirmText: 'Descartar',
        cancelText: 'Seguir editando'
      });
      if (!ok) return;
    }

    // Restaurar original y bloquear
    const orig = this.originalById.get(id) ?? { cuerposeguimiento: this.items[i]?.cuerposeguimiento ?? '' };
    this.rows.at(i).reset(orig, { emitEvent: false });
    this.rows.at(i).disable({ emitEvent: false });
    this.editingIds.delete(id);
  }

  async onSave(i: number): Promise<void> {
    const id = this.items[i]?.id;
    if (id == null|| this._idconsulta == null) return;

    const current = this.rows.at(i).getRawValue() as RowValue;
    const original = this.originalById.get(id) ?? { cuerposeguimiento: '' };

    const changes: RowPatch = {};
    if ((current.cuerposeguimiento ?? '') !== (original.cuerposeguimiento ?? '')) {
      changes.cuerposeguimiento = current.cuerposeguimiento ?? '';
    }

    if (Object.keys(changes).length === 0) {
      await this.notify.ok({
        variant: 'info',
        title: 'Sin cambios',
        message: 'No hay cambios para guardar.',
        primaryText: 'Aceptar'
      });
      return;
    }

    const confirm = await this.notify.confirm({
      variant: 'info',
      title: 'Guardar cambios',
      message: '¿Deseas guardar los cambios realizados?',
      confirmText: 'Guardar',
      cancelText: 'Cancelar'
    });
    if (!confirm) return;

    try {
      // Nota: si update() devuelve Observable, cambia a:
      // await firstValueFrom(this.service.update(id, changes));
      await this.service.update(this._idconsulta,id, changes as any);

      // Actualizar original y modelo visible
      this.originalById.set(id, { ...original, ...changes });
      this.items[i] = { ...this.items[i], ...changes };

      await this.notify.ok({
        variant: 'success',
        title: 'Cambios guardados',
        message: 'El seguimiento se actualizó correctamente.',
        primaryText: 'Aceptar'
      });

      this.rows.at(i).disable({ emitEvent: false });
      this.editingIds.delete(id);
    } catch (e) {
      // Se asume interceptor muestra diálogo; aquí no vaciamos nada.
      console.error('Error al guardar seguimiento', e);
    }
  }

  /* =========================
     Utilidades
     ========================= */
  trackById(_index: number, item: VMSeguimientoListaSimple): number {
    return item.id;
  }
}
