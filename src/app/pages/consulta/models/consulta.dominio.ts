// Estados que maneja el backend hoy (1 y 2).
export enum EstadoConsulta {
  EN_PROGRESO = 1,
  FINALIZADO = 2,
}

// Opciones para selects, chips, etc.
export const ESTADO_CONSULTA_OPCIONES: ReadonlyArray<{ value: EstadoConsulta; label: string }> = [
  { value: EstadoConsulta.EN_PROGRESO, label: 'EN PROGRESO' },
  { value: EstadoConsulta.FINALIZADO, label: 'FINALIZADO' },
];

// Helper para mostrar texto desde el código
export function estadoConsultaToLabel(v: number | null | undefined): string {
  switch (v) {
    case EstadoConsulta.EN_PROGRESO: return 'EN PROGRESO';
    case EstadoConsulta.FINALIZADO:  return 'FINALIZADO';
    default:                         return '—';
  }
}