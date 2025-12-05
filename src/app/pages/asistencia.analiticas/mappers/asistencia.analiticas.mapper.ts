// src/app/pages/asistencia.analiticas/mappers/asistencia.analiticas.mapper.ts

import {
  ApiAsistenciaDashboardResponse,
  ApiAsistenciaDiaUsuario,
  ApiEstadoAsistencia,
} from '../models/asistencia.analiticas.api';

import {
  VMAsistenciaDashboard,
  VMAsistenciaCards,
  VMBarrasAsistencia,
  VMEstadoActualRow,
  VMEstadoAsistencia,
} from '../models/asistencia.analiticas.vm';

/* ================= Helpers de fecha ================= */

function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(d0: Date, delta: number): Date {
  const d = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate());
  d.setDate(d.getDate() + delta);
  return d;
}

function fmtFechaCorta(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat('es-PE', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(dt);
}

/* ================= Cards (hoy y ayer) ================= */

function mapCards(items: ApiAsistenciaDiaUsuario[]): VMAsistenciaCards {
  const hoy = new Date();
  const hoyYmd = toYmd(hoy);
  const ayerYmd = toYmd(addDays(hoy, -1));

  const hoyItems = items.filter(
    (i) => i.fecha_ymd === hoyYmd && i.tuvo_horario,
  );
  const ayerItems = items.filter(
    (i) => i.fecha_ymd === ayerYmd && i.tuvo_horario,
  );

  const totalProgramadosHoy = hoyItems.length;
  const asistenciasHoy = hoyItems.filter((i) => i.asistio).length;
  const tardanzasHoy = hoyItems.filter((i) => i.fue_tarde).length;
  const ausentesHoy = hoyItems.filter((i) => i.fue_ausente).length;
  const incompletosAyer = ayerItems.filter((i) => i.incompleto).length;

  return {
    totalProgramadosHoy,
    asistenciasHoy,
    tardanzasHoy,
    ausentesHoy,
    incompletosAyer,
  };
}

/* ================= Barras apiladas por día ================= */

function mapBarras(items: ApiAsistenciaDiaUsuario[]): VMBarrasAsistencia {
  const diasUnicos = Array.from(
    new Set(items.map((i) => i.fecha_ymd)),
  ).sort(); // "YYYY-MM-DD" ordena bien lexicográficamente

  const categories: string[] = [];
  const aTiempo: number[] = [];
  const tarde: number[] = [];
  const ausente: number[] = [];
  const incompleto: number[] = [];

  for (const dia of diasUnicos) {
    const delDia = items.filter(
      (i) => i.fecha_ymd === dia && i.tuvo_horario,
    );

    const cntATiempo = delDia.filter(
      (i) => i.asistio && !i.fue_tarde,
    ).length;
    const cntTarde = delDia.filter((i) => i.fue_tarde).length;
    const cntAusente = delDia.filter((i) => i.fue_ausente).length;
    const cntIncompleto = delDia.filter((i) => i.incompleto).length;

    categories.push(fmtFechaCorta(dia));
    aTiempo.push(cntATiempo);
    tarde.push(cntTarde);
    ausente.push(cntAusente);
    incompleto.push(cntIncompleto);
  }

  return {
    categories,
    series: [
      { name: 'A tiempo', data: aTiempo },
      { name: 'Tarde', data: tarde },
      { name: 'Ausente', data: ausente },
      { name: 'Incompleto', data: incompleto },
    ],
  };
}

/* ================= Estado actual (tabla) ================= */

function deriveEstado(f: ApiAsistenciaDiaUsuario): ApiEstadoAsistencia {
  if (!f.tuvo_horario) return 'SIN_HORARIO';
  if (f.fue_ausente) return 'AUSENTE';
  if (f.incompleto) return 'INCOMPLETO';
  if (f.fue_tarde) return 'TARDE';
  if (f.asistio) return 'A_TIEMPO';
  // Tenía horario pero no hay asistencia ni marcas claras
  return 'NO_INICIA';
}

function mapEstadoLabelAndClass(estado: ApiEstadoAsistencia): {
  label: string;
  css: string;
} {
  switch (estado) {
    case 'A_TIEMPO':
      return { label: 'A tiempo', css: 'badge-ok' };
    case 'TARDE':
      return { label: 'Tarde', css: 'badge-warn' };
    case 'AUSENTE':
      return { label: 'Ausente', css: 'badge-danger' };
    case 'INCOMPLETO':
      return { label: 'Incompleto', css: 'badge-warn-soft' };
    case 'NO_INICIA':
      return { label: 'Aún no inicia', css: 'badge-muted' };
    case 'SIN_HORARIO':
      return { label: 'Sin horario', css: 'badge-muted' };
    case 'FUERA_HORARIO':
      return { label: 'Fuera de horario', css: 'badge-info' };
    default:
      return { label: String(estado), css: 'badge-muted' };
  }
}

function mapEstadoActual(
  items: ApiAsistenciaDiaUsuario[],
): VMEstadoActualRow[] {
  if (!items.length) return [];

  const conHorario = items.filter((i) => i.tuvo_horario);

  if (!conHorario.length) return [];

  const diasUnicos = Array.from(
    new Set(conHorario.map((i) => i.fecha_ymd)),
  ).sort();

  const hoyYmd = toYmd(new Date());

  // Si el rango incluye hoy, usamos hoy; si no, usamos el último día del rango
  const diaReferencia = diasUnicos.includes(hoyYmd)
    ? hoyYmd
    : diasUnicos[diasUnicos.length - 1];

  const rows = conHorario.filter((i) => i.fecha_ymd === diaReferencia);

  return rows.map((r) => {
    const estado = deriveEstado(r);
    const { label, css } = mapEstadoLabelAndClass(estado);

    return {
      usId: r.us_id,
      nombre: r.nombre?.trim() || `Usuario #${r.us_id}`,
      horario: r.tuvo_horario ? 'Con horario' : 'Sin horario',
      horaInicio: null,                         // seguimos sin hora de inicio de horario
      primeraMarca: r.hora_primera_marca ?? null, // AQUÍ usamos la hora que viene del backend
      estado: estado as VMEstadoAsistencia,
      estadoLabel: label,
      estadoBadgeClass: css,
    };
  });
}

/* ================= Mapper principal ================= */

export function mapAsistenciaDashboard(
  api: ApiAsistenciaDashboardResponse,
): VMAsistenciaDashboard {
  const items = api.items ?? [];

  const cards = mapCards(items);
  const barras = mapBarras(items);
  const estadoActual = mapEstadoActual(items);

  return {
    cards,
    barras,
    estadoActual,
    fechaDesde: api.desde,
    fechaHasta: api.hasta,
  };
}
