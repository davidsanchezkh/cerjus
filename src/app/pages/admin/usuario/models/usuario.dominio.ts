// src/app/pages/usuario/models/usuario.dominio.ts

export const ESTADO_USUARIO_OPCIONES = [
  { value: 1, label: 'Activo' },
  { value: 2, label: 'Suspendido' },
  { value: 0, label: 'Eliminado' },
] as const;

export type EstadoUsuario = (typeof ESTADO_USUARIO_OPCIONES)[number]['value'];

export function estadoUsuarioToLabel(v: number | null | undefined): string {
  const hit = ESTADO_USUARIO_OPCIONES.find(o => o.value === v);
  return hit ? hit.label : '—';
}
