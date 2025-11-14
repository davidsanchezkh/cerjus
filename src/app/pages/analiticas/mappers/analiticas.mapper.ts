import {
  ApiSerieAtenciones,
  ApiSerieCiudadanos,
  ApiPastelMaterias,
  ApiEtlStatus
} from '../models/analiticas.api';
import {
  VMBarrasApiladas,
  VMLineaCiudadanos,
  VMPastelMaterias,
  PeriodView,
  PeriodKind,
  VMEtlStatus
} from '../models/analiticas.vm';

/* ============ helpers ============ */
function fmtFecha(d: Date): string {
  return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short' }).format(d);
}
function fmtSemana(d: Date): string {
  const f = new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short' }).format(d);
  return `sem ${f}`;
}
function fmtMes(d: Date): string {
  return new Intl.DateTimeFormat('es-PE', { month: 'short', year: 'numeric' }).format(d);
}
function fmtAnio(d: Date): string {
  return String(d.getFullYear());
}
function normDate(v: any): string | null {
  if (v == null) return null;
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'number') return new Date(v).toISOString();
  if (typeof v === 'string') return v.trim() ? v : null;
  try { return new Date(v).toISOString(); } catch { return null; }
}

/* ============ Línea: ciudadanos ============ */
export function mapLineaCiudadanos(api: ApiSerieCiudadanos[]): VMLineaCiudadanos {
  const categories: string[] = [];
  const nuevos: number[] = [];
  const acumulado: number[] = [];

  for (const r of api) {
    const d = new Date(r.periodo);
    categories.push(new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short' }).format(d));
    nuevos.push(r.nuevos ?? 0);
    acumulado.push(r.acumulado ?? 0);
  }
  return { categories, nuevos, acumulado };
}

/* ============ Barras apiladas: atenciones ============ */
export function mapAtencionesBarras(
  api: ApiSerieAtenciones[],
  view?: PeriodView,
  kind?: PeriodKind
): VMBarrasApiladas {
  const categories: string[] = [];
  const consultas: number[] = [];
  const seguimientos: number[] = [];

  for (const r of api) {
    const d = new Date(r.periodo);
    let label: string;

    switch (view ?? (kind === 'year' ? 'month' : 'day')) {
      case 'week':  label = fmtSemana(d); break;
      case 'month': label = fmtMes(d);    break;
      case 'year':  label = fmtAnio(d);   break;
      case 'day':
      default:      label = fmtFecha(d);  break;
    }
    categories.push(label);
    consultas.push(r.consultas ?? 0);
    seguimientos.push(r.seguimientos ?? 0);
  }

  return {
    categories,
    series: [
      { name: 'Consultas',    data: consultas },
      { name: 'Seguimientos', data: seguimientos },
    ]
  };
}

/* ============ Pastel: materias ============ */
export function mapPastelMaterias(api: ApiPastelMaterias): VMPastelMaterias {
  const labels: string[] = [];
  const series: number[] = [];
  for (const r of api) {
    const label = (r.materia_nombre ?? r.materia ?? (r.materia_id != null ? String(r.materia_id) : '—')).toString();
    labels.push(label);
    series.push(Number(r.cantidad ?? 0));
  }
  return { labels, series };
}

/* ============ ETL Status (shape real) ============ */
export function mapEtlStatus(api: ApiEtlStatus): VMEtlStatus {
  const running = !!api.isRunning;

  // Si está corriendo, tomamos info del objeto "running"
  const runObj = api.running ?? null;

  const runId = runObj?.id ?? null;
  const runningSince = normDate(runObj?.started_at) ?? null;
  const runningPreset = (runObj?.preset ?? null) as string | null;

  // Última exitosa (lo que necesitas para "Últ. cálculo")
  // Si no hay éxito previo pero sí hay una ejecución terminada, caemos a finished_at.
  const lastRunAt =
    normDate(api.lastSuccessAt) ??
    normDate(runObj?.finished_at) ??
    null;

  const lastStart =
    normDate(api.lastSuccessStart) ??
    normDate(runObj?.start_date) ??
    null;

  const lastEnd =
    normDate(api.lastSuccessEnd) ??
    normDate(runObj?.end_date) ??
    null;

  return { running, runId, runningSince, runningPreset, lastRunAt, lastStart, lastEnd };
}
