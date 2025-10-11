
import { VMLoginCreate} from '../models/login.vm';
import { DTOLoginCreate} from '../models/login.dtos';

export function MapLoginCreate(vm:VMLoginCreate):DTOLoginCreate{

  return{
    us_DNI: vm.dni.trim(),
    us_nombres: toUpperSafe(vm.nombres),
    us_apellido_p: toUpperSafe(vm.apellidoPaterno),
    us_apellido_m: toUpperSafe(vm.apellidoMaterno),
    us_telefono: toUpperSafe(vm.telefono),
    us_correo_e: vm.correoE.trim(),
    us_contrasena: vm.contrasena.trim(),
  };
}
function toUpperSafe(s?: string|null): string {
  return (s ?? '').trim().toUpperCase();
}