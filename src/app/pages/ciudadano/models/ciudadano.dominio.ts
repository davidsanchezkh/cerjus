//Materia
export const CONOCIO_CIUDADANO_OPCIONES = [
  { value: 'AMIGO',        label: 'Amigo' },
  { value: 'VECINO',       label: 'Vecino' },
  { value: 'VOLANTE',      label: 'Volante' },
  { value: 'OTROS',        label: 'Otros' },
] as const;

export type Conocio = typeof CONOCIO_CIUDADANO_OPCIONES[number]['value'] | '';

export function conocioToLabel(v: Conocio | null | undefined): string {
  return CONOCIO_CIUDADANO_OPCIONES.find(o => o.value === v)?.label ?? '—';
}
export function conocioToDB(conocios: Conocio, conocioOtros?: string): string {
  if (conocios && conocios !== 'OTROS') return conocios;                     // catálogo
  const otro = (conocioOtros ?? '').trim();
  return (otro || 'OTROS').toUpperCase().slice(0, 30);                      // único campo co_materia_consulta
}

export function conocioFromDB(ci_conocio: string | null | undefined): {
  conocios: Conocio; conocioOtros: string;
} {
  const raw = (ci_conocio ?? '').trim().toUpperCase();
  if (!raw) return { conocios: '', conocioOtros: '' };
  const hit = CONOCIO_CIUDADANO_OPCIONES.some(o => o.value === raw && raw !== 'OTROS');
  return hit ? { conocios: raw as Conocio, conocioOtros: '' }
             : { conocios: 'OTROS', conocioOtros: raw === 'OTROS' ? '' : raw };
}