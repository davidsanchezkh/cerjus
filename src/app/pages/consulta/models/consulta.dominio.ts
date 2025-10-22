// Estado
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

//Materia
export const MATERIA_CONSULTA_OPCIONES = [
  { value: 'DERECHO CIVIL',          label: 'Derecho Civil' },
  { value: 'DERECHO FAMILIAR',       label: 'Derecho Familiar' },
  { value: 'DERECHO LABORAL',        label: 'Derecho Laboral' },
  { value: 'DERECHO PENAL',          label: 'Derecho Penal' },
  { value: 'DERECHO CONSTITUCIONAL', label: 'Derecho Constitucional' },
  { value: 'DERECHO SUCESORIO',      label: 'Derecho Sucesorio' },
  { value: 'OTROS',                  label: 'Otros' },
] as const;

export type Materia = typeof MATERIA_CONSULTA_OPCIONES[number]['value'] | '';

export function materiaToLabel(v: Materia | null | undefined): string {
  return MATERIA_CONSULTA_OPCIONES.find(o => o.value === v)?.label ?? '—';
}
export function materiaToDB(materias: Materia, materiaOtros?: string): string {
  if (materias && materias !== 'OTROS') return materias;                     // catálogo
  const otro = (materiaOtros ?? '').trim();
  return (otro || 'OTROS').toUpperCase().slice(0, 150);                      // único campo co_materia_consulta
}

export function materiaFromDB(co_materia_consulta: string | null | undefined): {
  materias: Materia; materiaOtros: string;
} {
  const raw = (co_materia_consulta ?? '').trim().toUpperCase();
  if (!raw) return { materias: '', materiaOtros: '' };
  const hit = MATERIA_CONSULTA_OPCIONES.some(o => o.value === raw && raw !== 'OTROS');
  return hit ? { materias: raw as Materia, materiaOtros: '' }
             : { materias: 'OTROS', materiaOtros: raw === 'OTROS' ? '' : raw };
}