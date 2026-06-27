// Lleva caso con nosotros
export type LlevaCasoConNosotros = 'SI' | 'NO' | 'POR_CONFIRMAR';

export const LLEVA_CASO_OPCIONES: ReadonlyArray<{ value: LlevaCasoConNosotros; label: string }> = [
  { value: 'SI', label: 'SÍ' },
  { value: 'NO', label: 'NO' },
  { value: 'POR_CONFIRMAR', label: 'POR CONFIRMAR' },
];

export function llevaCasoToLabel(v: string | null | undefined): string {
  switch (v) {
    case 'SI': return 'SÍ';
    case 'NO': return 'NO';
    case 'POR_CONFIRMAR': return 'POR CONFIRMAR';
    default: return '—';
  }
}

// Materia
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
  if (materias && materias !== 'OTROS') return materias;

  const otro = (materiaOtros ?? '').trim();
  return (otro || 'OTROS').toUpperCase().slice(0, 150);
}

export function materiaFromDB(co_materia_consulta: string | null | undefined): {
  materias: Materia;
  materiaOtros: string;
} {
  const raw = (co_materia_consulta ?? '').trim().toUpperCase();

  if (!raw) return { materias: '', materiaOtros: '' };

  const hit = MATERIA_CONSULTA_OPCIONES.some(o => o.value === raw && raw !== 'OTROS');

  return hit
    ? { materias: raw as Materia, materiaOtros: '' }
    : { materias: 'OTROS', materiaOtros: raw === 'OTROS' ? '' : raw };
}