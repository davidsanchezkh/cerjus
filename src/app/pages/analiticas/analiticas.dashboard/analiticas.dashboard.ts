// src/app/pages/analiticas/analiticas.dashboard/analiticas.dashboard.ts
import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NgApexchartsModule,
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexPlotOptions,
  ApexTooltip,
  ApexXAxis,
  ApexTitleSubtitle,
  ApexStroke,
  ApexNonAxisChartSeries,
} from 'ng-apexcharts';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { AnaliticasService } from '../services/analiticas.service';
import {
  VMPeriodQuery,
  VMBarrasApiladas,
  VMLineaCiudadanos,
  VMPastelMaterias,
  VMEtlStatus,
  PeriodKind,
  PeriodRange,
  PeriodView,
  VMDimMateria,
  VMDimCanal,
  VMDimUsuario,
} from '../models/analiticas.vm';
import { Subscription, forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import html2canvas from 'html2canvas'; // npm i html2canvas

type ChartOptionsBar = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  tooltip: ApexTooltip;
  title: ApexTitleSubtitle;
  subtitle: ApexTitleSubtitle;
};

type ChartOptionsLine = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  legend: ApexLegend;
  tooltip: ApexTooltip;
  title: ApexTitleSubtitle;
  subtitle: ApexTitleSubtitle;
};

type ChartOptionsDonut = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  legend: ApexLegend;
  tooltip: ApexTooltip;
  title: ApexTitleSubtitle;
  subtitle: ApexTitleSubtitle;
};

@Component({
  selector: 'app-analiticas-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgApexchartsModule],
  templateUrl: './analiticas.dashboard.html',
  styleUrls: ['./analiticas.dashboard.css'],
})
export class AnaliticasDashboard implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private svc = inject(AnaliticasService);

  // ====== filtros ======
  filtros = this.fb.group({
    kind: ['month' as PeriodKind],
    range: ['this' as PeriodRange],
    view: ['day' as PeriodView],

    materia_id: [null as number | null],
    canal_id: [null as number | null],
    us_id: [null as number | null],
  });

  // ====== datos UI encabezado ======
  etlStatus: VMEtlStatus | null = null;
  etlLabel = '—'; // texto largo de ETL
  periodMain = ''; // ej. "Mes actual · noviembre de 2025"
  headerDetail = ''; // ej. "Rango: ... · Materia: ... · Canal: ... · Usuario: ..."

  materias: VMDimMateria[] = [];
  canales: VMDimCanal[] = [];
  usuarios: VMDimUsuario[] = [];

  // ====== referencias a los charts ======
  @ViewChild('chartLine') chartLine?: ChartComponent;
  @ViewChild('chartBar') chartBar?: ChartComponent;
  @ViewChild('chartDonut') chartDonut?: ChartComponent;

  // ====== opciones de chart (estado visible) ======
  optLine: ChartOptionsLine = {
    series: [],
    chart: {
      type: 'line',
      height: 320,
      toolbar: {
        show: true, // botón nativo Apex (incluye descarga)
      },
      zoom: { enabled: false },
    },
    xaxis: { categories: [] },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    legend: { position: 'top' },
    tooltip: { shared: true, intersect: false },
    title: {
      text: '',
      align: 'left',
      margin: 8,
      style: { fontSize: '14px', fontWeight: '600' },
    },
    subtitle: {
      text: '',
      align: 'left',
      margin: 0,
      offsetY: 6,
      style: { fontSize: '11px', color: '#6c757d' },
    },
  };

  optBar: ChartOptionsBar = {
    series: [],
    chart: {
      type: 'bar',
      height: 320,
      stacked: true,
      toolbar: {
        show: true,
      },
    },
    xaxis: { categories: [] },
    plotOptions: { bar: { horizontal: false, columnWidth: '55%' } },
    dataLabels: { enabled: false },
    legend: { position: 'top' },
    tooltip: { shared: true, intersect: false },
    title: {
      text: '',
      align: 'left',
      margin: 8,
      style: { fontSize: '14px', fontWeight: '600' },
    },
    subtitle: {
      text: '',
      align: 'left',
      margin: 0,
      offsetY: 6,
      style: { fontSize: '11px', color: '#6c757d' },
    },
  };

  optDonut: ChartOptionsDonut = {
    series: [],
    chart: {
      type: 'donut',
      height: 320,
      toolbar: {
        show: true,
      },
    },
    labels: [],
    legend: { position: 'bottom' },
    tooltip: { shared: true, intersect: false },
    title: {
      text: '',
      align: 'left',
      margin: 8,
      style: { fontSize: '14px', fontWeight: '600' },
    },
    subtitle: {
      text: '',
      align: 'left',
      margin: 0,
      offsetY: 6,
      style: { fontSize: '11px', color: '#6c757d' },
    },
  };

  // ====== estado de carga tipo "asistencia" ======
  loading = false;
  firstLoad = true;
  showOverlay = false;

  private reqSeq = 0;
  private overlayTimer: any;
  private overlayShownAt = 0;
  private firstPaintStart = 0;

  private readonly overlayDelay = 180;
  private readonly minOverlayMs = 220;
  private readonly firstSkeletonMinMs = 200;

  // reintento para la primera carga (servidor “despertando”)
  private firstRetryDone = false;

  // Pendientes (se aplican al final para evitar saltos)
  private pendLine?: ChartOptionsLine;
  private pendBar?: ChartOptionsBar;
  private pendDonut?: ChartOptionsDonut;
  private pendPeriodMain = '';
  private pendHeaderDetail = '';

  private sub?: Subscription;

  ngOnInit(): void {
    // Cargamos meta + dimensiones + datos iniciales
    this.loadEtlStatus();
    this.loadDims();
    this.loadAll();

    // Cambios de filtros con debounce + comparación profunda
    this.sub = this.filtros.valueChanges
      .pipe(
        debounceTime(250),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      )
      .subscribe(() => this.loadAll());
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.cancelTimers();
  }

  // =======================
  // Carga de dimensiones
  // =======================
  private loadDims(): void {
    this.svc.getDimMaterias().subscribe({
      next: (ms) => (this.materias = ms),
      error: () => (this.materias = []),
    });

    this.svc.getDimCanales().subscribe({
      next: (cs) => (this.canales = cs),
      error: () => (this.canales = []),
    });

    this.svc.getDimUsuarios().subscribe({
      next: (us) => (this.usuarios = us),
      error: () => (this.usuarios = []),
    });
  }

  // ====== Acciones toolbar ======
  actualizar(): void {
    // Botón fuerte: refresca ETL + dimensiones + datos
    this.loadEtlStatus();
    this.loadDims();
    this.loadAll();
  }

  // ====== Query actual desde el form ======
  private currentQuery(): VMPeriodQuery {
    const f = this.filtros.value;
    return {
      kind: (f.kind ?? 'month') as PeriodKind,
      range: (f.range ?? 'this') as PeriodRange,
      view: (f.view ?? 'day') as PeriodView,

      materia_id: f.materia_id ?? undefined,
      canal_id: f.canal_id ?? undefined,
      us_id: f.us_id ?? undefined,
    };
  }

  // =======================
  // Helpers de fecha (frontend)
  // =======================
  private mondayOfWeek(d: Date): Date {
    const tmp = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const day = tmp.getDay(); // 0..6 (0=domingo)
    const diff = day === 0 ? -6 : 1 - day;
    tmp.setDate(tmp.getDate() + diff);
    return tmp;
  }

  private buildHeaderMeta(q: VMPeriodQuery): { periodMain: string; subtitle: string } {
    const now = new Date();
    const kind = q.kind ?? 'month';
    const range = q.range ?? 'this';

    let start: Date;
    let end: Date;
    let labelPeriodo: string;

    if (kind === 'week') {
      const base = this.mondayOfWeek(now);
      if (range === 'last') {
        base.setDate(base.getDate() - 7);
      }
      start = base;
      end = new Date(base);
      end.setDate(end.getDate() + 6);
      labelPeriodo = range === 'last' ? 'Semana pasada' : 'Semana actual';
    } else if (kind === 'year') {
      const y = now.getFullYear() + (range === 'last' ? -1 : 0);
      start = new Date(y, 0, 1);
      end = new Date(y, 11, 31);
      labelPeriodo = range === 'last' ? 'Año anterior' : 'Año actual';
    } else {
      // month (por defecto)
      const base = new Date(
        now.getFullYear(),
        now.getMonth() + (range === 'last' ? -1 : 0),
        1,
      );
      start = base;
      end = new Date(base.getFullYear(), base.getMonth() + 1, 0);
      labelPeriodo = range === 'last' ? 'Mes pasado' : 'Mes actual';
    }

    const fmtMonthYear = new Intl.DateTimeFormat('es-PE', {
      month: 'long',
      year: 'numeric',
    });
    const fmtDay = new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const periodMain = `${labelPeriodo} · ${fmtMonthYear.format(start)}`;
    const rango = `Rango: ${fmtDay.format(start)} – ${fmtDay.format(end)}`;

    // Filtros legibles
    const materia =
      q.materia_id != null
        ? this.materias.find((m) => m.materia_id === q.materia_id)?.materia_nombre ??
          `Materia #${q.materia_id}`
        : 'Todas las materias';

    const canal =
      q.canal_id != null
        ? this.canales.find((c) => c.canal_id === q.canal_id)?.canal_nombre ??
          `Canal #${q.canal_id}`
        : 'Todos los canales';

    let usuario = 'Todos los usuarios';
    if (q.us_id != null) {
      const u = this.usuarios.find((u) => u.us_id === q.us_id);
      usuario = u ? `${u.nombres} ${u.apellidos}` : `Usuario #${q.us_id}`;
    }

    const filtros = `Materia: ${materia} · Canal: ${canal} · Usuario: ${usuario}`;

    // IMPORTANTE: ya no añadimos etlLabel aquí para que no duplique/salte
    const subtitle = `${rango} · ${filtros}`;
    return { periodMain, subtitle };
  }

  // =======================
  // Timers
  // =======================
  private cancelTimers(): void {
    clearTimeout(this.overlayTimer);
  }

  private finishLoadingWithOverlayMin(): void {
    const applyData = () => {
      if (this.pendLine) this.optLine = this.pendLine;
      if (this.pendBar) this.optBar = this.pendBar;
      if (this.pendDonut) this.optDonut = this.pendDonut;

      this.periodMain = this.pendPeriodMain;
      this.headerDetail = this.pendHeaderDetail;

      if (this.firstLoad) {
        this.firstLoad = false;
      }
    };

    const complete = () => {
      this.loading = false;
      clearTimeout(this.overlayTimer);

      if (this.showOverlay) {
        const elapsed = performance.now() - this.overlayShownAt;
        const remain = Math.max(0, this.minOverlayMs - elapsed);
        setTimeout(() => {
          this.showOverlay = false;
          applyData();
        }, remain);
      } else {
        this.showOverlay = false;
        applyData();
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

  // =======================
  // Carga de datos y actualización de charts
  // =======================
  private loadAll(): void {
    const q = this.currentQuery();
    const meta = this.buildHeaderMeta(q);
    this.pendPeriodMain = meta.periodMain;
    this.pendHeaderDetail = meta.subtitle;

    this.cancelTimers();
    const myReq = ++this.reqSeq;
    this.loading = true;

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

    forkJoin({
      linea: this.svc.lineaCiudadanos(q),
      barras: this.svc.barrasAtenciones(q),
      donut: this.svc.pastelMaterias(q),
    }).subscribe({
      next: (vm: {
        linea: VMLineaCiudadanos;
        barras: VMBarrasApiladas;
        donut: VMPastelMaterias;
      }) => {
        if (myReq !== this.reqSeq) return;

        this.pendLine = {
          ...this.optLine,
          series: [
            { name: 'Nuevos', data: vm.linea.nuevos },
            { name: 'Acumulado', data: vm.linea.acumulado },
          ],
          xaxis: { categories: vm.linea.categories },
        };

        this.pendBar = {
          ...this.optBar,
          series: vm.barras.series,
          xaxis: { categories: vm.barras.categories },
        };

        this.pendDonut = {
          ...this.optDonut,
          series: vm.donut.series,
          labels: vm.donut.labels,
        };

        this.finishLoadingWithOverlayMin();
      },
      error: () => {
        if (myReq !== this.reqSeq) return;

        // Primer intento fallido (servidor “despertando”): reintentar una vez
        if (this.firstLoad && !this.firstRetryDone) {
          this.firstRetryDone = true;
          setTimeout(() => {
            // sólo reintentar si seguimos en la misma request lógica
            if (this.reqSeq === myReq) {
              this.loadAll();
            }
          }, 1200);
          return;
        }

        // En errores posteriores, mantenemos los datos anteriores
        this.pendLine = this.optLine;
        this.pendBar = this.optBar;
        this.pendDonut = this.optDonut;

        this.finishLoadingWithOverlayMin();
      },
    });
  }

  // ====== ETL status ======
  private loadEtlStatus(): void {
    this.svc.getEtlStatus().subscribe({
      next: (s) => {
        this.etlStatus = s;
        this.etlLabel = this.formatEtlStatus(s);

        // Recalcular encabezados con la nueva ETL
        const q = this.currentQuery();
        const meta = this.buildHeaderMeta(q);
        this.periodMain = meta.periodMain;
        this.headerDetail = meta.subtitle;
      },
      error: () => {
        this.etlStatus = null;
        this.etlLabel = '—';
      },
    });
  }

  private formatEtlStatus(s: VMEtlStatus): string {
    const fDT = (iso?: string | null) =>
      iso
        ? new Intl.DateTimeFormat('es-PE', {
            dateStyle: 'short',
            timeStyle: 'short',
          }).format(new Date(iso))
        : '—';
    const fD = (iso?: string | null) =>
      iso
        ? new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(
            new Date(iso),
          )
        : '—';

    if (s.running) {
      const since = fDT(s.runningSince);
      return `ETL en curso · run #${s.runId ?? '—'} · desde ${since}`;
    }
    const last = fDT(s.lastRunAt);
    const r0 = fD(s.lastStart);
    const r1 = fD(s.lastEnd);
    return last !== '—'
      ? `Última ETL: ${last} — Rango: ${r0} a ${r1}`
      : 'Última ETL: —';
  }

  // ====== ETL acciones (coinciden con el HTML)
  runPreset(preset: string): void {
    this.svc.runEtlPreset(preset as any).subscribe(() => {
      this.loadEtlStatus();
      this.actualizar();
    });
  }

  runFillMissing(): void {
    this.svc
      .runEtlPreset('MISSING')
      .subscribe(() => {
        this.loadEtlStatus();
        this.actualizar();
      });
  }

  // =======================
  // Exportar TODO el panel como PNG (encabezado + 3 gráficos)
  // =======================
  async exportPanelPng(): Promise<void> {
    const host = document.querySelector('.analytics-shell') as HTMLElement | null;
    if (!host) {
      return;
    }

    // Añadimos una clase para ocultar toolbars/botones en la captura
    host.classList.add('exporting');

    try {
      const canvas = await html2canvas(host, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'panel-analiticas.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      host.classList.remove('exporting');
    }
  }
}
