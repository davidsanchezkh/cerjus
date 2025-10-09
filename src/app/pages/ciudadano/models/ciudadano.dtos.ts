//lo que se envia al backend
export interface DTOCiudadano{
  ci_ID: number;
  ci_DNI: string;
  ci_nombres: string;
  ci_apellido_p: string;
  ci_apellido_m: string;
  ci_domicilio: string;
  ci_ocupacion: string;
  ci_fecha_nacimiento: string;
  ci_hijos: number;
  ci_telefono: string;
  ci_correo_e: string;
  ci_conocio: string;
  ci_estado: number;
}
export type DTOCiudadanoCreate = Pick<DTOCiudadano,
  'ci_DNI'|'ci_nombres'|'ci_apellido_p'|'ci_apellido_m'|'ci_domicilio'|
  'ci_ocupacion'|'ci_fecha_nacimiento'|'ci_hijos'|'ci_telefono'|'ci_correo_e'|
  'ci_conocio'
>
export type DTOCiudadanoUpdate = 
  { ci_ID: DTOCiudadano["ci_ID"] } & Partial<Pick<DTOCiudadano,
  'ci_DNI'|'ci_nombres'|'ci_apellido_p'|'ci_apellido_m'|'ci_domicilio'|
  'ci_ocupacion'|'ci_fecha_nacimiento'|'ci_hijos'|'ci_telefono'|'ci_correo_e'|
  'ci_conocio'
>>
export type DTOCiudadanoSoftDelete= Pick<DTOCiudadano,
  'ci_ID'
>
export type DTOCiudadanoListaOptions =Partial<Pick<DTOCiudadano, 
  'ci_ID' | 'ci_DNI' |'ci_nombres'| 'ci_apellido_p' | 'ci_apellido_m' >> 
  & {
    page?: number;
    pageSize?: number;
    sort?: string;
  };









