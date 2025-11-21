// src/app/pages/usuario/models/usuario.vm.ts
import { EstadoUsuario } from './usuario.dominio';

export interface VMUsuario {
  id: number;
  dni: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  telefono: string;
  correoE: string;
  tz: string;

  estado: EstadoUsuario;
  estadoTexto: string;

  rolId: number | null;
  rolNombre: string | null;
  rolNivel: number | null;

  creadoPor: number | null;
  fechaCreadoPor: Date;
  modificadoPor: number | null;
  fechaModificadoPor: Date | null;
  estadoPor: number | null;
  fechaEstadoPor: Date | null;
}

export type VMUsuarioListaSimple = Pick<VMUsuario,
  'id'
  | 'dni'
  | 'apellidoPaterno'
  | 'apellidoMaterno'
  | 'nombres'
  | 'fechaCreadoPor'
>;

export type VMUsuarioDetalle = VMUsuario;

export type VMUsuarioUpdate =
  { id: VMUsuario["id"] } & Partial<Pick<VMUsuario,
    'estado' | 'rolId'
  >>;

export type VMUsuarioUpdateForm = Partial<Pick<VMUsuarioUpdate,
  'estado' | 'rolId'
>>;

export interface VMPage<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type VMUsuarioListaOptions = Partial<VMUsuarioListaSimple> & {
  estado?: EstadoUsuario | '';
  page?: number;
  pageSize?: number;
  sort?: string;
};
