//como el frontend lo trata la UI
export interface VMConsulta{
  id: number;
  idciudadano: number;
  resumen: string;
  fecha: Date;
  hechos: string;
  materia: string;
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
  'id' | 'resumen'| 'fecha'| 'estado' 
>&Partial<{
  fecha_formato: string;
}>;

export type  VMConsultaDetalleCompleta = VMConsulta;

export type VMConsultaDetalleSimple = Pick<VMConsultaListaCompleta, 
  'id' |'resumen'| 'fecha' | 'hechos' | 'materia' |'regresa'|
  'absolucion' | 'estado'
>

export type VMConsultaCreate= Pick<VMConsulta, 
  'idciudadano'|'resumen'|'hechos'|'regresa'|
  'absolucion'>
&{
  materias: string;
  materiaOtros: string;
}

export type VMConsultaUpdate= 
  { id: VMConsulta["id"] } & Partial<Pick<VMConsulta, 
  'resumen'| 'hechos'| 'materia'|'absolucion'|
  'estado'
>>
export type VMConsultaUpdateForm= Partial<Pick<VMConsultaUpdate, 
  'resumen'| 'hechos' | 'materia'|'absolucion'|
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








