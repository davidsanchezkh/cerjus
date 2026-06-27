// src/app/pages/proceso/models/proceso.dominio.ts

export const PROCESO_ESTADO_OPCIONES = [
  { value: 1, label: 'ACTIVO' },
  { value: 0, label: 'ELIMINADO' },
] as const;

export function procesoEstadoToLabel(v: number | null | undefined): string {
  switch (v) {
    case 1: return 'ACTIVO';
    case 0: return 'ELIMINADO';
    default: return '—';
  }
}

export function procesoEstadoBadgeClass(v: number | null | undefined): string {
  switch (v) {
    case 1: return 'bg-success';
    case 0: return 'bg-danger';
    default: return 'bg-secondary';
  }
}