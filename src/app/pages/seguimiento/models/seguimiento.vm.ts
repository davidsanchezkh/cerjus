//como el frontend lo trata la UI
export interface VMSeguimiento{
  id: number;
  idconsulta: number;
  cuerposeguimiento: string;
  estado: number;
  creadoPor: number;
  fechaCreadoPor: Date;
  modificadoPor: number;
  fechaModificadoPor: Date;
  estadoPor: number;
  fechaEstadoPor: Date;
}
export type VMSeguimientoListaCompleta = VMSeguimiento;

export type VMSeguimientoListaSimple = Pick<VMSeguimientoListaCompleta, 
  'id' | 'cuerposeguimiento'| 'fechaCreadoPor'
>&Partial<{
  fecha_formato: string;
}>;

export type  VMSeguimientoDetalleCompleta = VMSeguimiento;

export type VMSeguimientoDetalleSimple = Pick<VMSeguimientoListaCompleta, 
  'id' |'cuerposeguimiento'| 'fechaCreadoPor' 
>

export type VMSeguimientoCreate= Pick<VMSeguimiento, 
  'idconsulta'|'cuerposeguimiento'
>

export type VMSeguimientoUpdate= 
  { id: VMSeguimiento["id"],idconsulta:VMSeguimiento["idconsulta"] } & Partial<Pick<VMSeguimiento, 
  'cuerposeguimiento'
>>
export type VMSeguimientoUpdateForm= Partial<Pick<VMSeguimientoUpdate, 
  'cuerposeguimiento'
>>
export interface VMPage<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type VMSeguimientoListaOptions =Partial<VMSeguimientoListaSimple> &
Partial<Pick<VMSeguimiento, 'idconsulta'>>
& {
  page?: number;
  pageSize?: number;
  sort?:string;
};








