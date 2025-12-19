// justificacion.mapper.ts

import { ApiAsistenciaJustificacionItem, ApiPage } from '../models/justificacion.api';
import {
  VMAsistenciaJustificacionCreate,
  VMAsistenciaJustificacionItem,
  VMAsistenciaJustificacionListaOptions,
  VMPage,
} from '../models/justificacion.vm';


import { DTOAsistenciaJustificacionCreate, DTOAsistenciaJustificacionListaOptions } from '../models/justificacion.dtos';
import { estadoJustificacionToLabel, tipoJustificacionToLabel,resultadoJustificacionToLabel } from '../models/justificacion.dominio';

export function MapJustificacionCreate(vm: VMAsistenciaJustificacionCreate): DTOAsistenciaJustificacionCreate {
  return {
    fecha_ymd: (vm.fecha_ymd ?? '').trim(),
    tipo: vm.tipo as any,
    motivo: (vm.motivo ?? '').trim(),
    detalle: (vm.detalle ?? '').toString().trim() || null,
  };
}

export function MapJustificacionListaOpciones(vm: VMAsistenciaJustificacionListaOptions): DTOAsistenciaJustificacionListaOptions {
  const trim = (s?: string) => (s ?? '').trim();
  return {
    page: vm.page,
    pageSize: vm.pageSize,
    desde: trim(vm.desde) || undefined,
    hasta: trim(vm.hasta) || undefined,
     tipo: (vm.tipo ? vm.tipo : undefined),
    estado: (vm.estado ? (vm.estado as any) : undefined),
    us_id: vm.us_id ?? undefined,
  };
}

export function MapJustificacionItemVM(a: any): VMAsistenciaJustificacionItem {
  return {
    aj_ID: a.aj_ID,
    us_id: a.aj_us_ID,
    fecha_ymd: a.aj_fecha_ymd,
    fecha_label: a.aj_fecha_ymd, // o su formatter
    tipo: a.aj_tipo,
    tipo_label: tipoJustificacionToLabel(a.aj_tipo),
    estado: a.aj_estado,
    estado_label: estadoJustificacionToLabel(a.aj_estado),
    resultado: a.aj_resultado ?? null,
    resultado_label: resultadoJustificacionToLabel(a.aj_resultado), 
    incidencia: a.aj_incidencia ?? null,
    motivo: a.aj_motivo,
    detalle: a.aj_detalle ?? null,
    aprobado_por: a.aj_aprobado_por ?? null,
    aprobado_en: a.aj_aprobado_en ?? null,
    decision_motivo: a.aj_decision_motivo ?? null,
    creado_en: a.aj_creado_en ?? null,
  };
}

function formatFechaPeruYmd(ymd: string): string {
  // espera YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return ymd || '';
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
  return dt.toLocaleDateString('es-PE', { timeZone: 'America/Lima' });
}

export function MapPageToVM<TIn, TOut>(
  api: ApiPage<TIn>,
  mapItem: (x: TIn) => TOut
): VMPage<TOut> {
  const items = (api.items ?? []).map(mapItem);
  return {
    items,
    total: api.total ?? items.length,
    page: api.page ?? 1,
    pageSize: api.pageSize ?? (items.length | 0),
  };
}

// Formato dd/mm/yyyy, fijo Perú
function formatFechaPeruSoloDia(ymd: string): string {
  // ymd = YYYY-MM-DD
  const [y, m, d] = (ymd ?? '').split('-').map(x => Number(x));
  if (!y || !m || !d) return ymd ?? '';
  // Construimos fecha UTC para evitar offsets del navegador
  const dt = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
  const opciones: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Lima',
  };
  return dt.toLocaleDateString('es-PE', opciones);
}
