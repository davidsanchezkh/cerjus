//como el frontend lo trata la UI
import { EstadoConsulta,Materia } from './consulta.dominio';
export interface VMConsulta{
  id: number;
  idciudadano: number;
  resumen: string;
  fecha: Date;
  hechos: string;
  materia: string;

  materias: Materia;
  materiaOtros: string;
  
  absolucion: string;
  regresa:string;
  estado: number;
  
  creadoPor: number;
  fechaCreadoPor: string;
  modificadoPor: number;
  fechaModificadoPor: string;
  estadoPor: number;
  fechaEstadoPor: string;
}
export type VMConsultaListaCompleta = VMConsulta;

export type VMConsultaListaSimple = Pick<VMConsultaListaCompleta, 
  'id' | 'resumen' | 'fecha'
> & {
  estado: EstadoConsulta;  
  estadotexto: string;         // ← enum
} & Partial<{
  fecha_formato: string;
}>;

export type  VMConsultaDetalleCompleta = VMConsulta;

export type VMConsultaDetalleSimple = Pick<VMConsultaListaCompleta, 
  'id'|'idciudadano' |'resumen'| 'fecha' | 'hechos' |'materias'|'materiaOtros'|
  'regresa'|'absolucion' | 'estado'
>&{
  ciudadanodni:string;
}

export type VMConsultaCreate= Pick<VMConsulta, 
  'idciudadano'|'resumen'|'hechos'|'regresa'|'materias'|'materiaOtros'|
  'absolucion'
>


export type VMConsultaUpdate= 
  { id: VMConsulta["id"] } & Partial<Pick<VMConsulta, 
  'resumen'| 'hechos'|'absolucion'|'materias'|'materiaOtros'|
  'estado'
>>

export type VMConsultaUpdateForm= Partial<Pick<VMConsultaUpdate, 
  'resumen'| 'hechos' |'absolucion'|'materias'|'materiaOtros'|
  'estado'
>>
export interface VMPage<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type VMConsultaListaOptions =Partial<VMConsultaListaSimple> &
Partial<Pick<VMConsulta, 'idciudadano'>>
& {
  page?: number;
  pageSize?: number;
  sort?:string;
};









