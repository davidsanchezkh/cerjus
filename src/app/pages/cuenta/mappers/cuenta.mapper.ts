// src/app/pages/cuenta/mappers/cuenta.mapper.ts

import { VMCuentaCreate, VMCuentaPerfil, VMCuentaPerfilUpdateForm } from '../models/cuenta.vm';
import { DTOCuentaCreate, DTOCuentaPerfil, DTOCuentaPerfilUpdate } from '../models/cuenta.dtos';

export function MapCuentaCreate(vm: VMCuentaCreate): DTOCuentaCreate {
  return {
    us_DNI: vm.dni.trim(),
    us_nombres: toUpperSafe(vm.nombres),
    us_apellido_p: toUpperSafe(vm.apellidoPaterno),
    us_apellido_m: toUpperSafe(vm.apellidoMaterno),
    us_telefono: toUpperSafe(vm.telefono),
    us_correo_e: vm.correoE.trim(),
    us_contrasena: vm.contrasena.trim(),
  };
}

// Mapear DTO de perfil a VM de perfil
export function MapCuentaPerfilFromDTO(dto: DTOCuentaPerfil): VMCuentaPerfil {
  return {
    id: dto.us_ID,
    dni: dto.us_DNI,
    nombres: dto.us_nombres,
    apellidoPaterno: dto.us_apellido_p,
    apellidoMaterno: dto.us_apellido_m,
    telefono: dto.us_telefono,
    correoE: dto.us_correo_e,
    tz: dto.us_tz,
    fechaCreadoPor: dto.us_fecha_creado_por
      ? new Date(dto.us_fecha_creado_por)
      : null,
  };
}

// Mapear cambios de VM de perfil a DTO de actualización
export function MapCuentaPerfilUpdate(vm: VMCuentaPerfilUpdateForm): DTOCuentaPerfilUpdate {
  const dto: DTOCuentaPerfilUpdate = {};

  if (vm.nombres != null) dto.us_nombres = toUpperSafe(vm.nombres);
  if (vm.apellidoPaterno != null) dto.us_apellido_p = toUpperSafe(vm.apellidoPaterno);
  if (vm.apellidoMaterno != null) dto.us_apellido_m = toUpperSafe(vm.apellidoMaterno);
  if (vm.dni != null) dto.us_DNI = vm.dni.trim();
  if (vm.telefono != null) dto.us_telefono = vm.telefono.trim();
  if (vm.correoE != null) dto.us_correo_e = vm.correoE.trim();
  if (vm.tz != null) dto.us_tz = vm.tz.trim();

  return dto;
}

function toUpperSafe(s?: string | null): string {
  return (s ?? '').trim().toUpperCase();
}
