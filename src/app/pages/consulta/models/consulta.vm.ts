//como el frontend lo trata la UI
import { LlevaCasoConNosotros, Materia } from './consulta.dominio';

export interface VMConsulta {
  id: number;
  idciudadano: number;

  dni?: string | null;
  nombres?: string | null;
  apellidoPaterno?: string | null;
  apellidoMaterno?: string | null;

  resumen?: string | null;
  fecha: Date | string;
  fecha_formato?: string;

  hechos: string;
  materia: string;
  materias: Materia;
  materiaOtros: string;

  absolucion: string;

  llevaCaso: LlevaCasoConNosotros;
  llevaCasoTexto?: string;

  observaciones?: string | null;
  fechaRegistrada?: string | null;

  creadoPor: number;
  fechaCreadoPor: string;
  modificadoPor: number | null;
  fechaModificadoPor: string | null;
  estadoPor: number | null;
  fechaEstadoPor: string | null;
}
export interface VMConsultaControl {
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
/**
 * Lista general independiente de consultas.
 * GET /consulta
 */
export type VMConsultaListaGeneralSimple = Pick<
  VMConsulta,
  'id' |
  'idciudadano' |
  'dni' |
  'fecha' |
  'materias' |
  'materiaOtros' |
  'llevaCaso'
> & {
  materiaTexto: string;
  fecha_formato: string;
  llevaCasoTexto: string;
};

/**
 * Lista de consultas dentro del detalle del ciudadano.
 * GET /consulta/ciudadano/:id
 */
export type VMConsultaListaSimple = Pick<
  VMConsulta,
  'id' |
  'resumen' |
  'fecha' |
  'llevaCaso'
> & {
  fecha_formato: string;
  llevaCasoTexto: string;
};

export type VMConsultaDetalleSimple = Pick<
  VMConsulta,
  'id' |
  'idciudadano' |
  'dni' |
  'nombres' |
  'apellidoPaterno' |
  'apellidoMaterno' |
  'resumen' |
  'fecha' |
  'hechos' |
  'materias' |
  'materiaOtros' |
  'absolucion' |
  'llevaCaso' |
  'observaciones' |
  'fechaRegistrada'
>;

export type VMConsultaCreate = Pick<
  VMConsulta,
  'idciudadano' |
  'resumen' |
  'hechos' |
  'materias' |
  'materiaOtros' |
  'absolucion' |
  'llevaCaso' |
  'observaciones' |
  'fechaRegistrada'
>;

export type VMConsultaUpdate =
  { id: VMConsulta['id'] } &
  Partial<Pick<
    VMConsulta,
    'resumen' |
    'hechos' |
    'absolucion' |
    'materias' |
    'materiaOtros' |
    'llevaCaso' |
    'observaciones' |
    'fechaRegistrada'
  >>;

export type VMConsultaUpdateForm = Partial<Pick<
  VMConsultaUpdate,
  'resumen' |
  'hechos' |
  'absolucion' |
  'materias' |
  'materiaOtros' |
  'llevaCaso' |
  'observaciones' |
  'fechaRegistrada'
>>;

export interface VMPage<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type VMConsultaListaOptions = Partial<VMConsultaListaGeneralSimple> & {
  page?: number;
  pageSize?: number;
  sort?: string;
};

export type VMConsultaListaCiudadanoOptions = Partial<VMConsultaListaSimple> & {
  page?: number;
  pageSize?: number;
  sort?: string;
};

export interface VMConsultaCiudadanoResumen {
  id: number;
  dni: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
}







