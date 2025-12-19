export type EstadoUsuarioHorario = 0 | 1;

export const ESTADO_USUARIO_HORARIO_OPCIONES = [
  { value: 1 as EstadoUsuarioHorario, label: 'Activo' },
  { value: 0 as EstadoUsuarioHorario, label: 'Eliminado' },
];

export function estadoUsuarioHorarioToLabel(
  estado: EstadoUsuarioHorario | number | null | undefined,
): string {
  if (estado === 1) return 'Activo';
  if (estado === 0) return 'Eliminado';
  return 'Desconocido';
}
