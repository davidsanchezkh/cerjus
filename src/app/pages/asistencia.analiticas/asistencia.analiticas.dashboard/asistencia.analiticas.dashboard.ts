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
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import {
  AsistenciaPeriodKind,
  AsistenciaPeriodRange,
  VMAsistenciaDashboard,
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

  // ====== filtros básicos: periodo ======
  filtros = this.fb.group({
    kind: ['week' as AsistenciaPeriodKind],  // semana por defecto
    range: ['this' as AsistenciaPeriodRange], // esta semana
  });

  vm: VMAsistenciaDashboard | null = null;

  // Texto del encabezado
  headerTitle = 'Panel de asistencia';
  headerSubtitle = '';
  periodBadge = '';

  // Chart de barras apiladas
  @ViewChild('chartBar') chartBar?: ChartComponent;

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

  loading = false;
  firstLoad = true;

  private sub?: Subscription;

  ngOnInit(): void {
    // Primera carga
    this.loadAll();

    // Reactividad de filtros
    this.sub = this.filtros.valueChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      )
      .subscribe(() => this.loadAll());
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  // ===== Helper query =====
  private currentQuery(): VMAsistenciaQuery {
    const f = this.filtros.value;
    return {
      kind: (f.kind ?? 'week') as AsistenciaPeriodKind,
      range: (f.range ?? 'this') as AsistenciaPeriodRange,
    };
  }

  // ===== Encabezado legible =====
  private buildHeaderMeta(q: VMAsistenciaQuery, vm: VMAsistenciaDashboard): void {
    const kind = q.kind ?? 'week';
    const range = q.range ?? 'this';

    const fmtDay = new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const fmtMonthYear = new Intl.DateTimeFormat('es-PE', {
      month: 'long',
      year: 'numeric',
    });

    const d0 = new Date(vm.fechaDesde);
    const d1 = new Date(vm.fechaHasta);

    let labelPeriodo: string;
    if (kind === 'week') {
      labelPeriodo = range === 'last' ? 'Semana pasada' : 'Semana actual';
    } else if (kind === 'year') {
      labelPeriodo = range === 'last' ? 'Año anterior' : 'Año actual';
    } else {
      labelPeriodo = range === 'last' ? 'Mes pasado' : 'Mes actual';
    }

    this.periodBadge = labelPeriodo;
    const rango = `Rango: ${fmtDay.format(d0)} – ${fmtDay.format(d1)}`;

    // Para mes/año tiene sentido resaltar el mes inicial
    const periodoTexto = fmtMonthYear.format(d0);

    this.headerSubtitle = `${rango} · ${periodoTexto}`;
  }

  // ===== Acción "Actualizar" (botón) =====
  actualizar(): void {
    this.loadAll();
  }

  // ===== Carga de datos =====
  private loadAll(): void {
    const q = this.currentQuery();
    this.loading = true;

    this.svc.getDashboard(q).subscribe({
      next: (vm) => {
        this.vm = vm;

        // Actualizar gráfico
        this.optBar = {
          ...this.optBar,
          series: vm.barras.series,
          xaxis: { categories: vm.barras.categories },
          title: {
            ...this.optBar.title,
            text: 'Asistencia por día (A tiempo / Tarde / Ausente / Incompleto)',
          },
        };

        // Encabezado
        this.buildHeaderMeta(q, vm);

        this.loading = false;
        this.firstLoad = false;
      },
      error: () => {
        this.loading = false;
        // En caso de error mantenemos datos previos (si hubiera)
      },
    });
  }

  // Helpers para template
  get cards() {
    return this.vm?.cards ?? null;
  }

  get estadoRows() {
    return this.vm?.estadoActual ?? [];
  }
}
