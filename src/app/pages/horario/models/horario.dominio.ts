// src/app/features/horario/models/horario.dominio.ts
export const DIAS_SEMANA = [
  { value: 'LU', label: 'Lunes' },
  { value: 'MA', label: 'Martes' },
  { value: 'MI', label: 'Miércoles' },
  { value: 'JU', label: 'Jueves' },
  { value: 'VI', label: 'Viernes' },
  { value: 'SA', label: 'Sábado' },
  { value: 'DO', label: 'Domingo' },
] as const;

export type DiaSemana = typeof DIAS_SEMANA[number]['value']; // 'LU' | 'MA' | ...
