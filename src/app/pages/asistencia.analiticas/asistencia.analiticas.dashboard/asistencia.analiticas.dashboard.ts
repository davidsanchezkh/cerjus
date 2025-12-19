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
} from 'ng-apexcharts';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Subscription, forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import {
  AsistenciaPeriodKind,
  AsistenciaPeriodRange,
  VMAsistenciaDashboard,
  VMAsistenciaPeriodoPage,
  VMAsistenciaQuery,
} from '@app/pages/asistencia.analiticas/models/asistencia.analiticas.vm';
import { AsistenciasDashboardService } from '@app/pages/asistencia.analiticas/services/asistencia.analiticas.service';

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

@Component({
  selector: 'app-asistencias-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgApexchartsModule],
  templateUrl: './asistencia.analiticas.dashboard.html',
  styleUrls: ['./asistencia.analiticas.dashboard.css'],
})
export class AsistenciasDashboard implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private svc = inject(AsistenciasDashboardService);
  downloading = false;
  filtros = this.fb.group({
    kind: ['week' as AsistenciaPeriodKind],
    range: ['this' as AsistenciaPeriodRange],
  });

  dashboard: VMAsistenciaDashboard | null = null;
  periodo: VMAsistenciaPeriodoPage | null = null;

  headerTitle = 'Panel de asistencia';
  headerSubtitle = '';
  periodBadge = '';

  @ViewChild('chartBar') chartBar?: ChartComponent;

  optBar: ChartOptionsBar = {
    series: [],
    chart: { type: 'bar', height: 320, stacked: true, toolbar: { show: true } },
    xaxis: { categories: [] },
    plotOptions: { bar: { horizontal: false, columnWidth: '55%' } },
    dataLabels: { enabled: false },
    legend: { position: 'top' },
    tooltip: { shared: true, intersect: false },
    title: { text: '', align: 'left', margin: 8, style: { fontSize: '14px', fontWeight: '600' } },
    subtitle: { text: '', align: 'left', margin: 0, offsetY: 6, style: { fontSize: '11px', color: '#6c757d' } },
  };

  loadingDashboard = false;
  loadingPeriodo = false;
  firstLoad = true;

  private sub?: Subscription;

  // Tabla (server-side)
  tablaSegmento: 'anteriores' | 'hoy' | 'proximos' = 'hoy';
  page = 1;
  pageSize = 10;

  ngOnInit(): void {
    this.loadAll(true);

    this.sub = this.filtros.valueChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      )
      .subscribe(() => this.loadAll(true));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private currentQuery(): VMAsistenciaQuery {
    const f = this.filtros.value;
    return {
      kind: (f.kind ?? 'week') as AsistenciaPeriodKind,
      range: (f.range ?? 'this') as AsistenciaPeriodRange,
    };
  }

  private buildHeaderMeta(q: VMAsistenciaQuery, vm: VMAsistenciaDashboard): void {
    const kind = q.kind ?? 'week';
    const range = q.range ?? 'this';

    const fmtDay = new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
    const fmtMonthYear = new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric' });

    const d0 = new Date(vm.fechaDesde);
    const d1 = new Date(vm.fechaHasta);

    let labelPeriodo = 'Semana actual';
    if (kind === 'week') labelPeriodo = range === 'last' ? 'Semana pasada' : 'Semana actual';
    else if (kind === 'month') labelPeriodo = range === 'last' ? 'Mes pasado' : 'Mes actual';
    else labelPeriodo = range === 'last' ? 'Año anterior' : 'Año actual';

    this.periodBadge = labelPeriodo;

    const rango = `Rango: ${fmtDay.format(d0)} – ${fmtDay.format(d1)}`;
    const periodoTexto = kind === 'year' ? String(d0.getFullYear()) : fmtMonthYear.format(d0);
    this.headerSubtitle = `${rango} · ${periodoTexto}`;
  }

  actualizar(): void {
    this.loadAll(false);
  }

  setSegment(seg: 'anteriores' | 'hoy' | 'proximos'): void {
    this.tablaSegmento = seg;
    this.page = 1;
    this.loadPeriodo();
  }

  setPageSize(n: number): void {
    this.pageSize = n;
    this.page = 1;
    this.loadPeriodo();
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page -= 1;
      this.loadPeriodo();
    }
  }
  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page += 1;
      this.loadPeriodo();
    }
  }

  private loadAll(resetTable: boolean): void {
    const q = this.currentQuery();

    if (resetTable) {
      this.tablaSegmento = 'hoy';
      this.page = 1;
      this.pageSize = 10;
    }

    this.loadingDashboard = true;
    this.loadingPeriodo = true;

    forkJoin({
      dash: this.svc.getDashboard(q),
      page: this.svc.getPeriodoPage(q, this.tablaSegmento, this.page, this.pageSize),
    }).subscribe({
      next: ({ dash, page }) => {
        this.dashboard = dash;
        this.periodo = page;

        // Chart
        const kind = q.kind ?? 'week';
        const titulo = kind === 'year' ? 'Asistencia por mes' : 'Asistencia por día';

        this.optBar = {
          ...this.optBar,
          series: dash.barras.series,
          xaxis: { categories: dash.barras.categories },
          title: { ...this.optBar.title, text: titulo },
        };

        this.buildHeaderMeta(q, dash);

        this.loadingDashboard = false;
        this.loadingPeriodo = false;
        this.firstLoad = false;
      },
      error: () => {
        this.loadingDashboard = false;
        this.loadingPeriodo = false;
        this.firstLoad = false;
      },
    });
  }

  private loadPeriodo(): void {
    const q = this.currentQuery();
    this.loadingPeriodo = true;

    this.svc.getPeriodoPage(q, this.tablaSegmento, this.page, this.pageSize).subscribe({
      next: (pageVm) => {
        this.periodo = pageVm;
        // Ajuste defensivo: el backend devuelve page/pageSize reales
        this.page = pageVm.page;
        this.pageSize = pageVm.pageSize;
        this.loadingPeriodo = false;
      },
      error: () => {
        this.loadingPeriodo = false;
      },
    });
  }
  descargarTodoPeriodo(): void {
  // Usar el rango real que ya está aplicado por filtros Semana/Mes/Año + Este/Pasado
  if (!this.dashboard) return;

  const desde = this.dashboard.fechaDesde;
  const hasta = this.dashboard.fechaHasta;

  this.downloading = true;

  this.svc.exportPeriodoAllCsv(desde, hasta).subscribe({
    next: (resp) => {
      const blob = resp.body as Blob;

      // filename desde header si viene, si no fallback
      const cd = resp.headers.get('content-disposition') ?? '';
      const match = /filename="([^"]+)"/i.exec(cd);
      const filename = match?.[1] ?? `asistencias_periodo_${desde}_${hasta}.csv`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);

      this.downloading = false;
    },
    error: () => {
      this.downloading = false;
    },
  });
}
  // ===== Getters para template =====

  get cards() {
    return this.dashboard?.cards ?? null;
  }

  get estadoRows() {
    return this.periodo?.items ?? [];
  }

  get countHoy(): number {
    return this.periodo?.countHoy ?? this.dashboard?.countHoy ?? 0;
  }
  get countAnteriores(): number {
    return this.periodo?.countAnteriores ?? this.dashboard?.countAnteriores ?? 0;
  }
  get countProximos(): number {
    return this.periodo?.countProximos ?? this.dashboard?.countProximos ?? 0;
  }

  get estadoTotal(): number {
    return this.periodo?.total ?? 0;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.estadoTotal / this.pageSize));
  }

  get pageFrom(): number {
    if (this.estadoTotal === 0) return 0;
    return (this.page - 1) * this.pageSize + 1;
  }

  get pageTo(): number {
    return Math.min(this.estadoTotal, this.page * this.pageSize);
  }
}
