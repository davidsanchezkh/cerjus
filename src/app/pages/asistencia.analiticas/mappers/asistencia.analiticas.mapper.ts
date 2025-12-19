import {
  ApiAsistenciaDashboardResponse,
  ApiAsistenciaPeriodoPageResponse,
  ApiAsistenciaDiaUsuario,
  ApiEstadoAsistencia,
} from '../models/asistencia.analiticas.api';

import {
  VMAsistenciaDashboard,
  VMAsistenciaPeriodoPage,
  VMEstadoActualRow,
  VMEstadoAsistencia,
  VMBarrasAsistencia,
} from '../models/asistencia.analiticas.vm';

/* ===== Helpers fecha ===== */

function fmtDiaCorto(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat('es-PE', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(dt);
}

function fmtMesCorto(ym: string): string {
  // ym: "YYYY-MM"
  const [y, m] = ym.split('-').map(Number);
  const dt = new Date(y, m - 1, 1);
  return new Intl.DateTimeFormat('es-PE', {
    month: 'short',
    year: 'numeric',
  }).format(dt);
}

/* ===== Estados ===== */

function deriveEstado(r: ApiAsistenciaDiaUsuario): ApiEstadoAsistencia {
  if (!r.tuvo_horario) return 'SIN_HORARIO';
  if (r.es_pendiente) return 'PENDIENTE';
  if (r.es_futuro) return 'PENDIENTE';
  if (r.fue_ausente) return 'AUSENTE';
  if (r.incompleto) return 'INCOMPLETO';
  if (r.fue_tarde) return 'TARDE';
  if (r.asistio) return 'A_TIEMPO';
  return 'NO_INICIA';
}

function mapEstadoLabelAndClass(estado: ApiEstadoAsistencia): { label: string; css: string } {
  switch (estado) {
    case 'PENDIENTE':   return { label: 'Pendiente', css: 'badge-info' };
    case 'A_TIEMPO':    return { label: 'A tiempo', css: 'badge-ok' };
    case 'TARDE':       return { label: 'Tarde', css: 'badge-warn' };
    case 'AUSENTE':     return { label: 'Ausente', css: 'badge-danger' };
    case 'INCOMPLETO':  return { label: 'Incompleto', css: 'badge-warn-soft' };
    case 'NO_INICIA':   return { label: 'Aún no inicia', css: 'badge-muted' };
    case 'SIN_HORARIO': return { label: 'Sin horario', css: 'badge-muted' };
    case 'FUERA_HORARIO': return { label: 'Fuera de horario', css: 'badge-info' };
    default:            return { label: String(estado), css: 'badge-muted' };
  }
}

/* ===== Barras ===== */

function mapBarras(api: ApiAsistenciaDashboardResponse): VMBarrasAsistencia {
  const gran = api.barras.granularity;
  const cats = api.barras.categories.map((c) => (gran === 'MONTH' ? fmtMesCorto(c) : fmtDiaCorto(c)));

  return {
    granularity: gran,
    categories: cats,
    series: api.barras.series,
  };
}

/* ===== Dashboard ===== */

export function mapAsistenciaDashboard(api: ApiAsistenciaDashboardResponse): VMAsistenciaDashboard {
  return {
    cards: api.cards,
    barras: mapBarras(api),
    fechaDesde: api.desde,
    fechaHasta: api.hasta,
    countHoy: api.countHoy,
    countAnteriores: api.countAnteriores,
    countProximos: api.countProximos,
  };
}

/* ===== Periodo page (tabla) ===== */

export function mapAsistenciaPeriodoPage(api: ApiAsistenciaPeriodoPageResponse): VMAsistenciaPeriodoPage {
  const rows: VMEstadoActualRow[] = (api.items ?? []).map((r) => {
    const estado = deriveEstado(r);
    const { label, css } = mapEstadoLabelAndClass(estado);

    return {
      fechaYmd: r.fecha_ymd,
      fechaLabel: fmtDiaCorto(r.fecha_ymd),

      usId: r.us_id,
      nombre: r.nombre?.trim() || `Usuario #${r.us_id}`,

      horario: r.tuvo_horario ? 'Con horario' : 'Sin horario',
      horaInicio: r.hora_inicio_programada ?? null,
      primeraMarca: r.hora_primera_marca ?? null,

      estado: estado as VMEstadoAsistencia,
      estadoLabel: label,
      estadoBadgeClass: css,
    };
  });

  return {
    segment: api.segment,
    page: api.page,
    pageSize: api.pageSize,
    total: api.total,
    countHoy: api.countHoy,
    countAnteriores: api.countAnteriores,
    countProximos: api.countProximos,
    items: rows,
  };
}
