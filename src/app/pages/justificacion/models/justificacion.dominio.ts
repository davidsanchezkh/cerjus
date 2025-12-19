// justificacion.dominio.ts

// =========================
// Tipos (UI / filtros)
// =========================

// Tipos de solicitud (catálogo)
export type AsistenciaJustificacionTipo = 'TARDANZA' | 'SIN_MARCA' | 'NO_PROGRAMADO' | '';

// Estados del flujo (máquina de estados)
export type AsistenciaJustificacionEstado = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';

// Estado para filtros (incluye “”, para “Todos”)
export type AsistenciaJustificacionTipoFiltro = AsistenciaJustificacionTipo;
export type AsistenciaJustificacionEstadoFiltro = AsistenciaJustificacionEstado | '';

// Resultado (impacto analítico esperado)
export type AsistenciaJustificacionResultado =
  | 'JUSTIFICADO_LLEGO_A_TIEMPO'
  | 'JUSTIFICADO_ASISTIO'
  | 'JUSTIFICADO_NO_PROGRAMADO'
  | '';

// Incidencia que “subsanará” (identificación conceptual)
export type AsistenciaJustificacionIncidencia = 'TARDE' | 'AUSENTE' | 'INCOMPLETO' | '';

// =========================
// Opciones de selects
// =========================

export const ASISTENCIA_JUSTIFICACION_TIPO_OPCIONES = [
  { value: 'TARDANZA',      label: 'Tardanza (se considera a tiempo)' },
  { value: 'SIN_MARCA',     label: 'Sin marca (se considera asistió)' },
  { value: 'NO_PROGRAMADO', label: 'No programado (excluir del cómputo)' },
] as const;

export const ASISTENCIA_JUSTIFICACION_ESTADO_OPCIONES = [
  { value: 'PENDIENTE', label: 'PENDIENTE' },
  { value: 'APROBADA',  label: 'APROBADA' },
  { value: 'RECHAZADA', label: 'RECHAZADA' },
] as const;

// Útil para selects de filtro
export const AJ_TIPO_OPCIONES = [
  { value: '' as const, label: 'TODOS' },
  ...ASISTENCIA_JUSTIFICACION_TIPO_OPCIONES,
] as const;

export const AJ_ESTADO_OPCIONES: ReadonlyArray<{ value: AsistenciaJustificacionEstadoFiltro; label: string }> = [
  { value: '',          label: 'Todos' },
  { value: 'PENDIENTE', label: 'PENDIENTE' },
  { value: 'APROBADA',  label: 'APROBADA' },
  { value: 'RECHAZADA', label: 'RECHAZADA' },
] as const;

// =========================
// Labels
// =========================

export function tipoJustificacionToLabel(v: AsistenciaJustificacionTipo | null | undefined): string {
  return ASISTENCIA_JUSTIFICACION_TIPO_OPCIONES.find(o => o.value === v)?.label ?? '—';
}

export function estadoJustificacionToLabel(v: AsistenciaJustificacionEstado | null | undefined): string {
  switch (v) {
    case 'PENDIENTE': return 'PENDIENTE';
    case 'APROBADA':  return 'APROBADA';
    case 'RECHAZADA': return 'RECHAZADA';
    default:          return '—';
  }
}

export function resultadoJustificacionToLabel(v: AsistenciaJustificacionResultado | null | undefined): string {
  switch (v) {
    case 'JUSTIFICADO_LLEGO_A_TIEMPO':   return 'Justificado (llegó a tiempo)';
    case 'JUSTIFICADO_ASISTIO':          return 'Justificado (asistió)';
    case 'JUSTIFICADO_NO_PROGRAMADO':    return 'Justificado (no programado)';
    default:                              return '—';
  }
}

export function incidenciaJustificacionToLabel(v: AsistenciaJustificacionIncidencia | null | undefined): string {
  switch (v) {
    case 'TARDE':      return 'Tarde';
    case 'AUSENTE':    return 'Ausente';
    case 'INCOMPLETO': return 'Incompleto';
    default:           return '—';
  }
}

// =========================
// Reglas de dominio
// =========================

export function tipoToResultado(tipo: AsistenciaJustificacionTipo): AsistenciaJustificacionResultado {
  switch (tipo) {
    case 'TARDANZA':      return 'JUSTIFICADO_LLEGO_A_TIEMPO';
    case 'SIN_MARCA':     return 'JUSTIFICADO_ASISTIO';
    case 'NO_PROGRAMADO': return 'JUSTIFICADO_NO_PROGRAMADO';
    default:              return '';
  }
}

export function tipoToIncidencia(tipo: AsistenciaJustificacionTipo): AsistenciaJustificacionIncidencia {
  switch (tipo) {
    case 'TARDANZA':      return 'TARDE';
    case 'SIN_MARCA':     return 'AUSENTE';
    case 'NO_PROGRAMADO': return 'AUSENTE'; // coherente con el servicio backend actual
    default:              return '';
  }
}

export function tipoHelpText(v: AsistenciaJustificacionTipo | null | undefined): string {
  switch (v) {
    case 'TARDANZA':
      return 'Use esta opción cuando sí marcó, pero la tardanza debe considerarse “a tiempo” (por tolerancia o decisión del supervisor).';
    case 'SIN_MARCA':
      return 'Use esta opción cuando estuvo presente pero olvidó registrar la marca (no existe asistencia).';
    case 'NO_PROGRAMADO':
      return 'Use esta opción cuando, pese a existir horario, ese día debe excluirse del cómputo (feriado/acuerdo/fuerza mayor).';
    default:
      return '';
  }
}

// Validador “liviano” para evitar valores inesperados en UI
export function isTipoJustificacion(v: any): v is Exclude<AsistenciaJustificacionTipo, ''> {
  return v === 'TARDANZA' || v === 'SIN_MARCA' || v === 'NO_PROGRAMADO';
}
export function isEstadoJustificacion(v: any): v is AsistenciaJustificacionEstado {
  return v === 'PENDIENTE' || v === 'APROBADA' || v === 'RECHAZADA';
}

// =========================
// UX helpers
// =========================

export function estadoBadgeClass(estado: AsistenciaJustificacionEstado | null | undefined): string {
  switch (estado) {
    case 'PENDIENTE': return 'bg-warning text-dark';
    case 'APROBADA':  return 'bg-success';
    case 'RECHAZADA': return 'bg-danger';
    default:          return 'bg-secondary';
  }
}
