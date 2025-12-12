// src/app/pages/cuenta/models/cuenta.vm.ts

export interface VMCuenta {
  id: number;
  dni: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  telefono: string;
  correoE: string;
  contrasena: string;
}

// Para el PERFIL (sin contraseña, con tz y fecha)
export interface VMCuentaPerfil {
  id: number;
  dni: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  telefono: string;
  correoE: string;
  tz: string;
  fechaCreadoPor: Date | null;
}

// Lo que el usuario podrá editar en su perfil
export type VMCuentaPerfilUpdateForm = Partial<Pick<VMCuentaPerfil,
  'nombres' | 'apellidoPaterno' | 'apellidoMaterno' | 'dni' | 'telefono' | 'correoE' | 'tz'
>>;

// Para el formulario de cambio de contraseña
export interface VMCuentaChangePassword {
  actual: string;
  nueva: string;
  nuevaConfirm: string;
}

// Mantén tu VMCuentaCreate existente
export type VMCuentaCreate = Pick<VMCuenta,
  'dni'|'nombres'|'apellidoPaterno'|'apellidoMaterno'|'telefono'|
  'correoE'|'contrasena'
>;
