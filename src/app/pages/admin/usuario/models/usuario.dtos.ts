// src/app/pages/usuario/models/usuario.dtos.ts

export interface DTOUsuario {
  us_ID: number;
  us_tu_ID: number;
  us_correo_e: string;
  us_contrasena?: string;
  us_nombres: string;
  us_apellido_p: string;
  us_apellido_m: string;
  us_DNI: string;
  us_telefono: string;
  us_tz: string;
  us_estado: number;
  us_creado_por?: number | null;
  us_fecha_creado_por: string;
  us_modificado_por?: number | null;
  us_fecha_modificado_por?: string | null;
  us_estado_por?: number | null;
  us_fecha_estado_por?: string | null;
}

export type DTOUsuarioListaOptions = Partial<Pick<DTOUsuario,
  'us_ID'
  | 'us_DNI'
  | 'us_nombres'
  | 'us_apellido_p'
  | 'us_apellido_m'
  | 'us_estado'
>> & {
  page?: number;
  pageSize?: number;
  sort?: string;
};

export type DTOUsuarioUpdate =
  { us_ID: DTOUsuario['us_ID'] } & Partial<Pick<DTOUsuario,
    'us_estado' | 'us_tu_ID'
  >>;
