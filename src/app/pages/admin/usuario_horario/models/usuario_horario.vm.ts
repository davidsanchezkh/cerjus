import { EstadoUsuarioHorario } from './usuario_horario.dominio';

export interface VMUsuarioHorarioListaItem {
  id: number;
  usuarioId: number;
  usuarioNombre: string;
  horarioId: number;
  horarioNombre: string;
  horarioTz: string;
  desde: string | null;        // "YYYY-MM-DD"
  hasta: string | null;        // "YYYY-MM-DD"
  vigenciaTexto: string;       // texto amigable "Desde ...", "X – Y", etc.
  estado: EstadoUsuarioHorario | number;
  estadoTexto: string;
}

export interface VMUsuarioHorarioCreate {
  usuarioId: number;
  horarioId: number;
  desde?: string;              // "YYYY-MM-DD"
  hasta?: string;              // "YYYY-MM-DD"
  cerrarAnterior: boolean;
}

export interface VMUsuarioHorarioListaOptions {
  usuarioId: number;
  estado?: number;
  page?: number;
  pageSize?: number;
}

export interface VMPage<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
