export interface VMLogin{
  id: number;
  dni: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  telefono: string;
  correoE: string;
  contrasena: string;
}
export type VMLoginCreate = Pick<VMLogin,
  'dni'|'nombres'|'apellidoPaterno'|'apellidoMaterno'|'telefono'|
  'correoE'|'contrasena'
>