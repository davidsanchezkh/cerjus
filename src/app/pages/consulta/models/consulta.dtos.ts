//lo que se envia al backend
import { LlevaCasoConNosotros } from './consulta.dominio';

export interface DTOConsulta {
  co_ID: number;
  co_ci_ID: number;

  co_resumen?: string | null;
  co_fecha: Date | string;

  co_hechos_consulta: string;
  co_materia_consulta: string;
  co_absolucion_consulta: string;

  co_lleva_caso: LlevaCasoConNosotros;
  co_observaciones?: string | null;
  co_fecha_registrada?: string | null;
}

export type DTOConsultaCreate = Pick<
  DTOConsulta,
  'co_ci_ID' |
  'co_resumen' |
  'co_hechos_consulta' |
  'co_materia_consulta' |
  'co_absolucion_consulta' |
  'co_lleva_caso' |
  'co_observaciones' |
  'co_fecha_registrada'
>;

export type DTOConsultaUpdate =
  { co_ID: DTOConsulta['co_ID'] } &
  Partial<Pick<
    DTOConsulta,
    'co_resumen' |
    'co_hechos_consulta' |
    'co_materia_consulta' |
    'co_absolucion_consulta' |
    'co_lleva_caso' |
    'co_observaciones' |
    'co_fecha_registrada'
  >>;

export type DTOConsultaSoftDelete = Pick<DTOConsulta, 'co_ID'>;

export type DTOConsultaListaOptions = {
  page?: number;
  pageSize?: number;
  sort?: string;

  co_ID?: number | string;
  ci_DNI?: string;
  co_materia_consulta?: string;
  co_lleva_caso?: LlevaCasoConNosotros;
};

export type DTOConsultaListaCiudadanoOptions = {
  page?: number;
  pageSize?: number;
  sort?: string;

  co_ID?: number | string;
  co_resumen?: string;
  co_fecha?: Date | string;
  co_lleva_caso?: LlevaCasoConNosotros;
}









