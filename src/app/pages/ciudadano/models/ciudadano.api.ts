// Lo que devuelve su backend (nombres ci_*)
export interface ApiCiudadano {
  ci_ID: number;
  ci_DNI: string;
  ci_nombres: string;
  ci_apellido_p: string;
  ci_apellido_m: string;

  ci_domicilio: string;
  ci_nacionalidad?: string | null;
  ci_direccion_actual?: string | null;
  ci_detalle_discapacidad?: string | null;

  ci_ocupacion: string;
  ci_fecha_nacimiento: Date;
  ci_hijos: number;
  ci_telefono: string;
  ci_correo_e: string | null;
  ci_conocio: string;

  ci_estado: number;
  ci_fecha_registrada?: Date | null;
  ci_creado_por: number;
  ci_fecha_creado_por: Date;
  ci_modificado_por: number | null;
  ci_fecha_modificado_por: Date | null;
  ci_estado_por: number | null;
  ci_fecha_estado_por: Date | null;

  ci_creado_por_nombre?: string | null;
  ci_creado_por_dni?: string | null;

  ci_modificado_por_nombre?: string | null;
  ci_modificado_por_dni?: string | null;
  
}

export type ApiCiudadanoListaCompleta = ApiCiudadano;

export type ApiCiudadanoListaSimple = Pick<
  ApiCiudadanoListaCompleta,
  'ci_ID' |
  'ci_DNI' |
  'ci_nombres' |
  'ci_apellido_p' |
  'ci_apellido_m' |
  'ci_nacionalidad'
>;

export type ApiCiudadanoDetalleCompleta = ApiCiudadano;
export interface ApiCiudadanoControl {
  ci_ID: number;

  ci_creado_por: number;
  ci_creado_por_nombre?: string | null;
  ci_creado_por_dni?: string | null;
  ci_fecha_creado_por: Date;

  ci_modificado_por?: number | null;
  ci_modificado_por_nombre?: string | null;
  ci_modificado_por_dni?: string | null;
  ci_fecha_modificado_por?: Date | null;
}
export type ApiCiudadanoDetalleSimple = Pick<
  ApiCiudadanoDetalleCompleta,
  'ci_ID' |
  'ci_DNI' |
  'ci_nombres' |
  'ci_apellido_p' |
  'ci_apellido_m' |
  'ci_domicilio' |
  'ci_nacionalidad' |
  'ci_direccion_actual' |
  'ci_detalle_discapacidad' |
  'ci_ocupacion' |
  'ci_fecha_nacimiento' |
  'ci_hijos' |
  'ci_telefono' |
  'ci_correo_e' |
  'ci_conocio' |
  'ci_fecha_registrada'
>;

export interface ApiCiudadanoPageSimple {
  items: ApiCiudadanoListaSimple[];
  total: number;
  page: number;
  pageSize: number;
}