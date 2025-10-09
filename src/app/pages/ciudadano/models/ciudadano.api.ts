// Lo que devuelve su backend (nombres ci_*)
export interface ApiCiudadano {
  ci_ID: number;
  ci_DNI: string;
  ci_nombres: string;
  ci_apellido_p: string;
  ci_apellido_m: string;
  ci_domicilio: string;
  ci_ocupacion: string;
  ci_fecha_nacimiento: Date;
  ci_hijos: number;
  ci_telefono: string;
  ci_correo_e: string;
  ci_conocio: string;
  ci_estado: number;
  ci_creado_por: number;
  ci_fecha_creado_por: Date;
  ci_modificado_por: number;
  ci_fecha_modificado_por: Date;
  ci_estado_por: number;
  ci_fecha_estado_por: Date;
}
export type ApiCiudadanoListaCompleta = ApiCiudadano

export type ApiCiudadanoListaSimple = Pick<ApiCiudadanoListaCompleta,
 'ci_ID' | 'ci_DNI'|'ci_nombres' | 'ci_apellido_p' | 'ci_apellido_m'
>
export type ApiCiudadanoDetalleCompleta = ApiCiudadano

export type ApiCiudadanoDetalleSimple= Pick<ApiCiudadanoDetalleCompleta,
 'ci_ID' |'ci_DNI'| 'ci_nombres' | 'ci_apellido_p' | 'ci_apellido_m' |
 'ci_domicilio' | 'ci_ocupacion' | 'ci_fecha_nacimiento' | 'ci_hijos' | 'ci_telefono'|
 'ci_correo_e' | 'ci_conocio'
>
export interface ApiCiudadanoPageSimple {
  items: ApiCiudadanoListaSimple[];
  total: number;
  page: number;
  pageSize: number;
}