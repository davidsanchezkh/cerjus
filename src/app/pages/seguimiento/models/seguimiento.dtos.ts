//lo que se envia al backend
export interface DTOSeguimiento{
  se_co_ID:number;
  se_ID: number;
  se_cuerpo_consulta: string;
}
export type DTOSeguimientoCreate = Pick<DTOSeguimiento,
  'se_co_ID'|'se_cuerpo_consulta'
>
export type DTOSeguimientoUpdate = 
  { se_ID: DTOSeguimiento["se_ID"],se_co_ID:DTOSeguimiento["se_co_ID"] } 
  &Partial<Pick<DTOSeguimiento,
  'se_cuerpo_consulta'
>>
export type DTOSeguimientoSoftDelete= Pick<DTOSeguimiento,
  'se_co_ID'|'se_ID'
>
export type DTOSeguimientoListaOptions =Partial<Pick<DTOSeguimiento, 
  'se_co_ID' >> 
  & {
    page?: number;
    pageSize?: number;
    sort?: string;
  };









