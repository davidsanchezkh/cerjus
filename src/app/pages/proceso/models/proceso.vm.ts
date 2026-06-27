// src/app/pages/proceso/models/proceso.vm.ts

export interface VMProceso {
  id: number;
  idconsulta: number;
  idciudadano: number;
  dni: string;

  asesorInicialId: number;
  asesorInicialNombre?: string | null;

  asesorActualId?: number | null;
  asesorActualNombre?: string | null;

  numeroExpediente: string;
  sede: string ;
  parte: string ;
  materia: string ;
  demandado: string ;
  demandante: string;
  estadoProcesal: string ;
  observacion?: string | null;


  creadoPor?: number;
  fechaCreadoPor?: Date | string;
  modificadoPor?: number | null;
  fechaModificadoPor?: Date | string | null;
  estadoPor?: number | null;
  fechaEstadoPor?: Date | string | null;
}

export type VMProcesoListaSimple = Pick<
  VMProceso,
  | 'id'
  | 'idconsulta'
  | 'idciudadano'
  | 'dni'
  | 'asesorInicialId'
  | 'asesorInicialNombre'
  | 'asesorActualId'
  | 'asesorActualNombre'
  | 'numeroExpediente'
  | 'sede'
  | 'parte'
  | 'materia'
  | 'demandado'
  | 'demandante'
  | 'estadoProcesal'
  | 'observacion'

>;

export type VMProcesoDetalleSimple = VMProceso;

export type VMProcesoCreate = Pick<
  VMProceso,
  | 'idconsulta'
  | 'asesorActualId'
  | 'numeroExpediente'
  | 'sede'
  | 'parte'
  | 'materia'
  | 'demandado'
  | 'estadoProcesal'
  | 'observacion'
> & {
  fechaRegistrada?: string | null;
};

export type VMProcesoUpdate = Partial<Pick<
  VMProceso,
  | 'asesorActualId'
  | 'numeroExpediente'
  | 'sede'
  | 'parte'
  | 'materia'
  | 'demandado'
  | 'estadoProcesal'
  | 'observacion'
>> & {
  fechaRegistrada?: string | null;
};

export interface VMPage<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type VMProcesoListaOptions = Partial<VMProcesoListaSimple> & {
  page?: number;
  pageSize?: number;
  sort?: string;
};

export interface VMProcesoControl {
  id: number;

  creadoPor: number;
  creadoPorNombre?: string | null;
  creadoPorDni?: string | null;
  fechaCreadoPor: Date | string;

  modificadoPor?: number | null;
  modificadoPorNombre?: string | null;
  modificadoPorDni?: string | null;
  fechaModificadoPor?: Date | string | null;

  estadoPor?: number | null;
  estadoPorNombre?: string | null;
  estadoPorDni?: string | null;
  fechaEstadoPor?: Date | string | null;
}
export interface VMProcesoAsesorActual {
  id: number;
  asesorActualId: number;
  asesorActualNombre?: string | null;
}