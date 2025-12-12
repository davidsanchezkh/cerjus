// src/app/pages/cuenta/models/cuenta.dtos.ts

export interface DTOCuenta {
  us_ID: number;
  us_DNI: string;
  us_nombres: string;
  us_apellido_p: string;
  us_apellido_m: string;
  us_telefono: string;
  us_correo_e: string;
  us_contrasena: string;
}

export type DTOCuentaCreate = Pick<DTOCuenta,
  'us_DNI'|'us_nombres'|'us_apellido_p'|'us_apellido_m'|'us_telefono'|
  'us_correo_e'|'us_contrasena'
>;

// Para recibir el detalle del perfil (puedes reutilizar DTOCuenta o ampliarlo)
export interface DTOCuentaPerfil {
  us_ID: number;
  us_DNI: string;
  us_nombres: string;
  us_apellido_p: string;
  us_apellido_m: string;
  us_telefono: string;
  us_correo_e: string;
  us_tz: string;
  us_fecha_creado_por: string | null;
}

// Para actualizar MI perfil (coincide con UpdateUsuarioDto “light”)
export interface DTOCuentaPerfilUpdate {
  us_correo_e?: string;
  us_nombres?: string;
  us_apellido_p?: string;
  us_apellido_m?: string;
  us_DNI?: string;
  us_telefono?: string;
  us_tz?: string;
}

// Para cambio de contraseña (coincide con UpdateContrasenaDto)
export interface DTOCuentaChangePassword {
  us_contrasena: string;       // contraseña actual
  us_new_contrasena: string;   // nueva contraseña
}
