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
import { Subscription } from 'rxjs';
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
  headerDetail = ''; // ej. "Rango: ... · Materia: ... · ... · Última ETL..."

  materias: VMDimMateria[] = [];
  canales: VMDimCanal[] = [];
  usuarios: VMDimUsuario[] = [];

  // ====== referencias a los charts (por si se necesitan luego) ======
  @ViewChild('chartLine') chartLine?: ChartComponent;
  @ViewChild('chartBar') chartBar?: ChartComponent;
  @ViewChild('chartDonut') chartDonut?: ChartComponent;

  // ====== opciones de chart (defaults no-undefined) ======
  optLine: ChartOptionsLine = {
    series: [],
    chart: {
      type: 'line',
      height: 320,
      toolbar: {
        show: true, // recuperamos botón nativo de Apex (incluye descarga del gráfico)
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

  private sub?: Subscription;

  ngOnInit(): void {
    this.loadEtlStatus();
    this.loadDims();
    this.sub = this.filtros.valueChanges.subscribe(() => this.loadAll());
    this.loadAll(); // primera carga
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
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

  // ====== Acciones toolbar
  actualizar(): void {
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

    const parts = [rango, filtros];
    if (this.etlLabel && this.etlLabel !== '—') {
      parts.push(this.etlLabel); // ya incluye "Última ETL..."
    }

    const subtitle = parts.join(' · ');
    return { periodMain, subtitle };
  }

  // =======================
  // Carga de datos y actualización de charts
  // =======================
  private loadAll(): void {
    const q = this.currentQuery();
    const meta = this.buildHeaderMeta(q);
    this.periodMain = meta.periodMain;
    this.headerDetail = meta.subtitle;

    // LINEA: ciudadanos
    this.svc.lineaCiudadanos(q).subscribe((vm: VMLineaCiudadanos) => {
      this.optLine = {
        ...this.optLine,
        series: [
          { name: 'Nuevos', data: vm.nuevos },
          { name: 'Acumulado', data: vm.acumulado },
        ],
        xaxis: { categories: vm.categories },
      };
    });

    // BARRAS APILADAS: atenciones (Consultas + Seguimientos)
    this.svc.barrasAtenciones(q).subscribe((vm: VMBarrasApiladas) => {
      this.optBar = {
        ...this.optBar,
        series: vm.series,
        xaxis: { categories: vm.categories },
      };
    });

    // DONUT: materias
    this.svc.pastelMaterias(q).subscribe((vm: VMPastelMaterias) => {
      this.optDonut = {
        ...this.optDonut,
        series: vm.series,
        labels: vm.labels,
      };
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
    this.svc.runEtlPreset(preset).subscribe(() => {
      this.loadEtlStatus();
      this.actualizar();
    });
  }

  runFillMissing(): void {
    this.svc
      .runEtlPreset('FILL_MISSING_TO_TODAY')
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
