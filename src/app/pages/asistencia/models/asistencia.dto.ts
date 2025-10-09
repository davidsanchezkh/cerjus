//lo que se envia al backend
export interface DTOAsistencia{

}
export type DTOAsistenciaListaOptions =
  & {
    page?: number;
    pageSize?: number;
    sort?: string;
  };