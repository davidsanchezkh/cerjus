export interface DTOLogin{
  us_ID: number;
  us_DNI: string;
  us_nombres: string;
  us_apellido_p: string;
  us_apellido_m: string;
  us_telefono: string;
  us_correo_e: string;
  us_contrasena: string;
}
export type DTOLoginCreate = Pick<DTOLogin,
  'us_DNI'|'us_nombres'|'us_apellido_p'|'us_apellido_m'|'us_telefono'|
  'us_correo_e'|'us_contrasena'
>