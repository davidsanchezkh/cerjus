// Lo que devuelve su backend (nombres ci_*)
export interface ApiConsulta {
  co_ID: number;
  co_ci_ID: number;
  co_resumen: string;
  co_fecha: Date;
  co_hechos_consulta: string;
  co_materia_consulta: string;
  co_absolucion_consulta: string;
  co_regresa:string;
  co_estado: number;
  co_creado_por: number;
  co_fecha_creado_por: string;
  co_modificado_por: number;
  co_fecha_modificado_por: string;
  co_estado_por: number;
  co_fecha_estado_por: string;
}
export type ApiConsultaListaCompleta = ApiConsulta

export type ApiConsultaListaSimple = Pick<ApiConsultaListaCompleta,
 'co_ID' | 'co_resumen'|'co_fecha' | 'co_estado'
>

export type ApiConsultaDetalleCompleta = ApiConsulta

export type ApiConsultaDetalleSimple= Pick<ApiConsultaDetalleCompleta,
 'co_ID'| 'co_ci_ID'|'co_resumen'| 'co_fecha' | 'co_hechos_consulta' | 'co_materia_consulta' 
 |'co_regresa'|'co_absolucion_consulta' | 'co_estado'
>
export interface ApiConsultaPageSimple {
  items: ApiConsultaListaSimple[];
  total: number;
  page: number;
  pageSize: number;
}