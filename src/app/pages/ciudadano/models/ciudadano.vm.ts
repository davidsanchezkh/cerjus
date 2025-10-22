//como el frontend lo trata la UI
import { Conocio } from './ciudadano.dominio';
export interface VMCiudadano{
  id: number;
  dni: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  domicilio: string;
  ocupacion: string;
  fechaNacimiento: string;
  hijos: number;
  telefono: string;
  correoE: string;
  conocio: string;

  conocios: Conocio;
  conocioOtros: string;

  estado: number;
  creadoPor: number;
  fechaCreadoPor: Date;
  modificadoPor: number;
  fechaModificadoPor: Date;
  estadoPor: number;
  fechaEstadoPor: Date;
}
export type VMCiudadanoListaCompleta = VMCiudadano;

export type VMCiudadanoListaSimple = Pick<VMCiudadanoListaCompleta, 
  'id' | 'dni'| 'nombres'| 'apellidoPaterno' | 'apellidoMaterno'  
>;

export type  VMCiudadanoDetalleCompleta = VMCiudadano;

export type VMCiudadanoDetalleSimple = Pick<VMCiudadanoListaCompleta, 
  'id' | 'dni'| 'nombres'| 'apellidoPaterno' | 'apellidoMaterno'|'domicilio'|
  'ocupacion'|'fechaNacimiento'|'hijos'|'telefono'|'correoE'|
  'conocios'|'conocioOtros'
>

export type VMCiudadanoCreate= Pick<VMCiudadano, 
  'dni'| 'nombres'| 'apellidoPaterno' | 'apellidoMaterno'|'domicilio'|
  'ocupacion'|'fechaNacimiento'|'hijos'|'telefono'|'correoE'>
  &{
    supo: string;
    supoOtrosDetalle: string;
  }

export type VMCiudadanoUpdate= 
  { id: VMCiudadano["id"] } & Partial<Pick<VMCiudadano, 
  'dni'| 'nombres'| 'apellidoPaterno' | 'apellidoMaterno'|'domicilio'|
  'ocupacion'|'fechaNacimiento'|'hijos'|'telefono'|'correoE'|
  'conocios'|'conocioOtros'
>>
export type VMCiudadanoUpdateForm= Partial<Pick<VMCiudadanoUpdate, 
  'dni'| 'nombres'| 'apellidoPaterno' | 'apellidoMaterno'|'domicilio'|
  'ocupacion'|'fechaNacimiento'|'hijos'|'telefono'|'correoE'|
  'conocios'|'conocioOtros'
>>
export interface VMPage<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type VMCiudadanoListaOptions =Partial<VMCiudadanoListaSimple> & {
  page?: number;
  pageSize?: number;
  sort?:string;
};








