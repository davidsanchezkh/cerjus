// src/app/pages/usuario/models/usuario.api.ts

export interface ApiUsuario {
  us_ID: number;
  us_tu_ID: number;
  us_correo_e: string;
  // el backend NO devolverá la contraseña, pero lo dejamos opcional
  us_contrasena?: string;

  us_nombres: string;
  us_apellido_p: string;
  us_apellido_m: string;
  us_DNI: string;
  us_telefono: string;
  us_tz: string;
  us_estado: number;

  us_creado_por: number | null;
  us_fecha_creado_por: Date;
  us_modificado_por: number | null;
  us_fecha_modificado_por: Date | null;
  us_estado_por: number | null;
  us_fecha_estado_por: Date | null;

  // extras del detalle
  us_estado_texto?: string;
  tu_ID?: number | null;
  tu_nombre?: string | null;
  tu_nivel?: number | null;
}

export type ApiUsuarioListaSimple = Pick<ApiUsuario,
  'us_ID'
  | 'us_DNI'
  | 'us_apellido_p'
  | 'us_apellido_m'
  | 'us_nombres'
  | 'us_fecha_creado_por'
>;

export type ApiUsuarioDetalle = ApiUsuario;

export interface ApiUsuarioPageSimple {
  items: ApiUsuarioListaSimple[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiTipoUsuario {
  tu_ID: number;
  tu_nombre: string;
  tu_nivel: number;
}
export interface ApiResetContrasenaProvisionalResponse {
  us_ID: number;
  provisional: string;
}