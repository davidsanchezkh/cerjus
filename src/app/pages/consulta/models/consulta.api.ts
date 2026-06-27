// Lo que devuelve su backend (nombres ci_*)
import { LlevaCasoConNosotros } from './consulta.dominio';

// Lo que devuelve su backend
export interface ApiConsulta {
  co_ID: number;
  co_ci_ID: number;

  ci_DNI?: string | null;
  ci_nombres?: string | null;
  ci_apellido_p?: string | null;
  ci_apellido_m?: string | null;

  co_resumen?: string | null;
  co_fecha: Date | string;

  co_hechos_consulta: string;
  co_materia_consulta: string;
  co_absolucion_consulta: string;

  co_lleva_caso: LlevaCasoConNosotros;
  co_observaciones?: string | null;
  co_fecha_registrada?: Date | string | null;

  co_estado?: number;
  co_creado_por?: number;
  co_fecha_creado_por?: string;
  co_modificado_por?: number | null;
  co_fecha_modificado_por?: string | null;
  co_estado_por?: number | null;
  co_fecha_estado_por?: string | null;
}
export interface ApiConsultaControl {
  co_ID: number;

  co_creado_por: number;
  co_creado_por_nombre?: string | null;
  co_creado_por_dni?: string | null;
  co_fecha_creado_por: Date | string;

  co_modificado_por?: number | null;
  co_modificado_por_nombre?: string | null;
  co_modificado_por_dni?: string | null;
  co_fecha_modificado_por?: Date | string | null;
}
export type ApiConsultaListaGeneralSimple = Pick<
  ApiConsulta,
  'co_ID' |
  'co_ci_ID' |
  'ci_DNI' |
  'co_fecha' |
  'co_materia_consulta' |
  'co_lleva_caso'
>;

export type ApiConsultaListaCiudadanoSimple = Pick<
  ApiConsulta,
  'co_ID' |
  'co_resumen' |
  'co_fecha' |
  'co_lleva_caso'
>;

export type ApiConsultaDetalleSimple = Pick<
  ApiConsulta,
  'co_ID' |
  'co_ci_ID' |
  'ci_DNI' |
  'ci_nombres' |
  'ci_apellido_p' |
  'ci_apellido_m' |
  'co_resumen' |
  'co_fecha' |
  'co_hechos_consulta' |
  'co_materia_consulta' |
  'co_absolucion_consulta' |
  'co_lleva_caso' |
  'co_observaciones' |
  'co_fecha_registrada'
>;

export interface ApiConsultaPageGeneralSimple {
  items: ApiConsultaListaGeneralSimple[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiConsultaPageCiudadanoSimple {
  items: ApiConsultaListaCiudadanoSimple[];
  total: number;
  page: number;
  pageSize: number;
}
export interface ApiConsultaCiudadanoResumen {
  ci_ID: number;
  ci_DNI: string;
  ci_nombres: string;
  ci_apellido_p: string;
  ci_apellido_m: string;
}