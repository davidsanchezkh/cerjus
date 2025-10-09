// Lo que devuelve su backend (nombres ci_*)
export interface ApiSeguimiento{
  se_co_ID:number;
  se_ID: number;
  se_cuerpo_consulta: string;
  se_estado: number;
  se_creado_por: number;
  se_fecha_creado_por: Date;
  se_modificado_por: number;
  se_fecha_modificado_por: Date;
  se_estado_por: number;
  se_fecha_estado_por: Date;
}
export type ApiSeguimientoListaCompleta = ApiSeguimiento

export type ApiSeguimientoListaSimple = Pick<ApiSeguimientoListaCompleta,
 'se_ID' | 'se_cuerpo_consulta'|'se_fecha_creado_por'
>
export type ApiSeguimientoDetalleCompleta = ApiSeguimiento

export type ApiSeguimientoDetalleSimple= Pick<ApiSeguimientoDetalleCompleta,
 'se_ID' |'se_cuerpo_consulta'| 'se_fecha_creado_por'
>
export interface ApiSeguimientoPageSimple {
  items: ApiSeguimientoListaSimple[];
  total: number;
  page: number;
  pageSize: number;
}