// como el frontend lo trata la UI
import { Conocio } from './ciudadano.dominio';

export interface VMCiudadano {
  id: number;
  dni: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;

  domicilio: string;
  nacionalidad: string;
  direccionActual?: string | null;
  detalleDiscapacidad?: string | null;

  ocupacion: string;
  fechaNacimiento: string;
  hijos: number;
  telefono: string;
  correoE: string | null;
  conocio: string;

  conocios: Conocio;
  conocioOtros: string;

  usarFechaRegistrada: boolean;
  fechaRegistrada?: string | null;

  estado: number;
  creadoPor: number;
  fechaCreadoPor: Date;
  modificadoPor: number | null;
  fechaModificadoPor: Date | null;
  estadoPor: number | null;
  fechaEstadoPor: Date | null;

  creadoPorNombre?: string | null;
  creadoPorDni?: string | null;

  modificadoPorNombre?: string | null;
  modificadoPorDni?: string | null;

}

export type VMCiudadanoListaCompleta = VMCiudadano;

export type VMCiudadanoListaSimple = Pick<
  VMCiudadanoListaCompleta,
  'id' |
  'dni' |
  'nombres' |
  'apellidoPaterno' |
  'apellidoMaterno' |
  'nacionalidad'
>;

export type VMCiudadanoDetalleCompleta = VMCiudadano;
export interface VMCiudadanoControl {
  id: number;

  creadoPor: number;
  creadoPorNombre?: string | null;
  creadoPorDni?: string | null;
  fechaCreadoPor: Date | string;

  modificadoPor?: number | null;
  modificadoPorNombre?: string | null;
  modificadoPorDni?: string | null;
  fechaModificadoPor?: Date | string | null;
}
export type VMCiudadanoDetalleSimple = Pick<
  VMCiudadanoListaCompleta,
  'id' |
  'dni' |
  'nombres' |
  'apellidoPaterno' |
  'apellidoMaterno' |
  'domicilio' |
  'nacionalidad' |
  'direccionActual' |
  'detalleDiscapacidad' |
  'ocupacion' |
  'fechaNacimiento' |
  'hijos' |
  'telefono' |
  'correoE' |
  'conocios' |
  'conocioOtros' |
  'fechaRegistrada'
>;
export type VMCiudadanoCreate = Pick<
  VMCiudadano,
  'dni' |
  'nombres' |
  'apellidoPaterno' |
  'apellidoMaterno' |
  'domicilio' |
  'nacionalidad' |
  'direccionActual' |
  'detalleDiscapacidad' |
  'ocupacion' |
  'fechaNacimiento' |
  'hijos' |
  'telefono' |
  'correoE' |
  'usarFechaRegistrada'|
  'fechaRegistrada'
> & {
  supo: string;
  supoOtrosDetalle: string;
};

export type VMCiudadanoUpdate =
  { id: VMCiudadano['id'] } &
  Partial<Pick<
    VMCiudadano,
    'dni' |
    'nombres' |
    'apellidoPaterno' |
    'apellidoMaterno' |
    'domicilio' |
    'nacionalidad' |
    'direccionActual' |
    'detalleDiscapacidad' |
    'ocupacion' |
    'fechaNacimiento' |
    'hijos' |
    'telefono' |
    'correoE' |
    'conocios' |
    'conocioOtros' |
    'fechaRegistrada'
  >>;

export type VMCiudadanoUpdateForm = Partial<Pick<
  VMCiudadanoUpdate,
  'dni' |
  'nombres' |
  'apellidoPaterno' |
  'apellidoMaterno' |
  'domicilio' |
  'nacionalidad' |
  'direccionActual' |
  'detalleDiscapacidad' |
  'ocupacion' |
  'fechaNacimiento' |
  'hijos' |
  'telefono' |
  'correoE' |
  'conocios' |
  'conocioOtros' |
  'fechaRegistrada'
>>;

export interface VMPage<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type VMCiudadanoListaOptions = Partial<VMCiudadanoListaSimple> & {
  page?: number;
  pageSize?: number;
  sort?: string;
};





