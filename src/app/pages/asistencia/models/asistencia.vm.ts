//como el frontend lo trata la UI
export interface VMAsistencia{
    idasistencia: number;
    idusuario: number;
    fechalocal: Date;
    zonahoraria: string;
    estadoc: number;
    creadoen: Date;
    as_usuario: number;

    idmarca: bigint;
    idmarcaasistencia: number;
    tipo: string;
    fecha: Date;
    latitud: number;
    longitud: number;
    direccionip: string;
    accuracy: number;
    nota: string;
}
export type VMAsistenciaListaCompleta = VMAsistencia;

export type VMAsistenciaListaSimple = Pick<VMAsistenciaListaCompleta, 
  'tipo'
>&Partial<{
  fecha_formato: string;
}>;

export type  VMAsistenciaDetalleCompleta = VMAsistencia;

export type VMAsistenciaDetalleSimple = Pick<VMAsistenciaListaCompleta, 
  'idasistencia' | 'idusuario'| 'idmarca'| 'tipo' | 'fecha'|'latitud'|
  'longitud'|'direccionip'|'accuracy'|'nota'
>


export interface VMPage<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type VMAsistenciaListaOptions =Partial<VMAsistenciaListaSimple> & {
  page?: number;
  pageSize?: number;
  sort?:string;
};
