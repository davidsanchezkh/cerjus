import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ConsultaService } from '../services/consulta.service';
import { VMConsultaListaGeneralSimple } from '../models/consulta.vm';
import { Materia,MATERIA_CONSULTA_OPCIONES,LLEVA_CASO_OPCIONES, LlevaCasoConNosotros } from '../models/consulta.dominio';
import { NotificacionesService } from '@/app/components/notificaciones/services/notificaciones.service';
import { Subscription } from 'rxjs';
import { PageMetaService } from '@/app/services/page_meta.service';

@Component({
  selector: 'app-consulta-lista',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './consulta.lista.html', 
  styleUrl: './consulta.lista.css'
})
export class ConsultaLista implements OnInit ,OnDestroy {
    private fb = inject(FormBuilder);
    private service = inject(ConsultaService);
    private notify = inject(NotificacionesService);
    private pageMeta = inject(PageMetaService);
    private subForm = new Subscription();

    readonly materiaOpciones = MATERIA_CONSULTA_OPCIONES;
    readonly llevaCasoOpciones = LLEVA_CASO_OPCIONES;
    get isOtros(): boolean {
        return this.form.get('materias')!.value === 'OTROS';
    }

    form = this.fb.group({
        id: [null],
        dni: [''],
        materias: ['' as Materia],
        materiaOtros: [{ value: '', disabled: true }],
        llevaCaso: ['' as '' | LlevaCasoConNosotros],
        });

    items: VMConsultaListaGeneralSimple[] = [];
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

    private pendItems: VMConsultaListaGeneralSimple[] = [];
    private pendTotal = 0;
    private pendFrom = 0;
    private pendTo = 0;
    private pendPage = 1;
    private pendLastPage = 1;

    private reqSeq = 0;
    private overlayTimer: any;
    private emptyTimer: any;
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
        this.pageMeta.replace({
            titulo: 'Lista de Consultas',
        });

        this.load();

        this.subForm.add(
            this.form.valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
            )
            .subscribe(() => {
                this.page = 1;
                this.load();
            })
        );

        this.subForm.add(
            this.form.get('materias')!.valueChanges.subscribe(() => {
            this.syncMateriaOtros();
            })
        );

        this.syncMateriaOtros();
    }
    ngOnDestroy(): void {
        this.subForm.unsubscribe();
        this.cancelTimers();
        this.pageMeta.clear();
    }

    clear() {
        this.form.reset({
            id: null,
            dni: '',
            materias: '',
            materiaOtros: '',
            llevaCaso: '',
        });

        this.form.get('materiaOtros')!.disable({ emitEvent: false });

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

    private cancelTimers(): void {
        clearTimeout(this.overlayTimer);
        clearTimeout(this.emptyTimer);
    }

    load(): void {
        this.loading = true;
        this.cancelTimers();
        this.syncMateriaOtros();
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

        this.service.list({
            page: this.page,
            pageSize: this.pageSize,
            id: v.id || undefined,
            dni: v.dni || undefined,
            materias: v.materias || undefined,
            materiaOtros: v.materiaOtros || undefined,
            llevaCaso: v.llevaCaso || undefined,
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

        this.items = this.pendItems;
        this.total = this.pendTotal;
        this.shownFrom = this.pendFrom;
        this.shownTo = this.pendTo;
        this.shownPage = this.pendPage;
        this.shownLastPage = this.pendLastPage;
        this.shownTotal = this.pendTotal;

        this.showEmpty = this.items.length === 0;

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

    get lastPageCalc(): number {
        return this.lastPage;
    }

    trackById(_index: number, item: VMConsultaListaGeneralSimple) {
        return item.id;
    }
    private syncMateriaOtros(): void {
        const value = this.form.get('materias')!.value as Materia;
        const otrosCtrl = this.form.get('materiaOtros')!;

        if (value === 'OTROS') {
            otrosCtrl.enable({ emitEvent: false });
        } else {
            otrosCtrl.setValue('', { emitEvent: false });
            otrosCtrl.disable({ emitEvent: false });
        }

        otrosCtrl.updateValueAndValidity({ emitEvent: false });
    }
}