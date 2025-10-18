//lo que se envia al backend
import { EstadoConsulta } from './consulta.dominio';
export interface DTOConsulta{
  co_ID: number;
  co_ci_ID: number;
  co_resumen: string;
  co_fecha: Date;
  co_hechos_consulta: string;
  co_materia_consulta: string;
  co_absolucion_consulta: string;
  co_regresa:string;
  co_estado: number;
}
export type DTOConsultaCreate = Pick<DTOConsulta,
  'co_ci_ID'|'co_resumen'|'co_hechos_consulta'|'co_materia_consulta'|
  'co_absolucion_consulta'|'co_regresa'
>
export type DTOConsultaUpdate = 
  { co_ID: DTOConsulta["co_ID"] } & Partial<Pick<DTOConsulta,
  'co_resumen'|'co_hechos_consulta'|'co_materia_consulta'|'co_absolucion_consulta'|
  'co_estado'
>>
export type DTOConsultaSoftDelete= Pick<DTOConsulta,
  'co_ID'
>
export type DTOConsultaListaOptions =Partial<Pick<DTOConsulta, 
  'co_ID' | 'co_resumen' |'co_fecha'|'co_ci_ID' >> 
  & {
    co_estado?: EstadoConsulta;
    page?: number;
    pageSize?: number;
    sort?: string;
  };









