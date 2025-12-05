export interface DTOUsuarioHorarioListaOptions {
  page?: number;
  pageSize?: number;
  uh_us_ID?: number;
  uh_ho_ID?: number;
  uh_estado?: number;
  sort?: string;
}

export interface DTOUsuarioHorarioCreate {
  uh_us_ID: number;
  uh_ho_ID: number;
  uh_desde?: string;       // "YYYY-MM-DD"
  uh_hasta?: string;       // "YYYY-MM-DD"
  cerrarAnterior?: boolean;
}

export interface DTOUsuarioHorarioUpdate {
  uh_ID: number;
  uh_desde?: string;       // "YYYY-MM-DD"
  uh_hasta?: string;       // "YYYY-MM-DD"
  uh_estado?: number;
}
