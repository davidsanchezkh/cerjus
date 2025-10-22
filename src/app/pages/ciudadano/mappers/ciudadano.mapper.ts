import { ApiCiudadanoListaSimple,ApiCiudadanoDetalleSimple } from '../models/ciudadano.api';
import { VMPage,VMCiudadanoCreate, VMCiudadanoListaSimple, VMCiudadanoListaOptions,
  VMCiudadanoDetalleSimple,VMCiudadanoUpdate,VMCiudadanoUpdateForm } from '../models/ciudadano.vm';
import { DTOCiudadanoCreate, DTOCiudadanoListaOptions,DTOCiudadanoUpdate } from '../models/ciudadano.dtos';
import { conocioToDB,conocioFromDB,Conocio} from '../models/ciudadano.dominio';
//traductor entre API ↔ VM ↔ DTO.
export function MapCiudadanoListaItemVM(a: ApiCiudadanoListaSimple):VMCiudadanoListaSimple {
  return{
    id: a.ci_ID,
    dni: a.ci_DNI,
    apellidoPaterno: a.ci_apellido_p,
    apellidoMaterno: a.ci_apellido_m,
    nombres: a.ci_nombres
  };
}
export function MapCiudadanoCreate(vm:VMCiudadanoCreate):DTOCiudadanoCreate{

  return{
    ci_DNI: vm.dni.trim(),
    ci_nombres: toUpperSafe(vm.nombres),
    ci_apellido_p: toUpperSafe(vm.apellidoPaterno),
    ci_apellido_m: toUpperSafe(vm.apellidoMaterno),
    ci_domicilio: toUpperSafe(vm.domicilio),
    ci_ocupacion: toUpperSafe(vm.ocupacion),
    ci_fecha_nacimiento: new Date(vm.fechaNacimiento).toISOString(),
    ci_hijos: Number(vm.hijos ?? 0),
    ci_telefono: vm.telefono.trim(),
    ci_correo_e: vm.correoE.trim(),
    ci_conocio:
      toUpperSafe(vm.supo === 'OTROS'
        ? vm.supoOtrosDetalle.trim() || 'OTROS'
        : vm.supo)
  };
}
export function MapCiudadanoListaOpciones(vm:VMCiudadanoListaOptions):DTOCiudadanoListaOptions{
  const trimU=(s?:string)=>(s??'').trim();
  return {
    page: vm.page,
    pageSize: vm.pageSize,
    ci_ID:vm.id??undefined,
    ci_DNI:trimU(vm.dni),
    ci_apellido_p:trimU(vm.apellidoPaterno),
    ci_apellido_m:trimU(vm.apellidoMaterno),
    ci_nombres:trimU(vm.nombres),
  }
}
export function MapCiudadanoDetalleListaSimple(a:ApiCiudadanoDetalleSimple):VMCiudadanoDetalleSimple{
  const { conocios, conocioOtros } = conocioFromDB(a.ci_conocio);
  return{
    id: Number(a.ci_ID),
    dni: a.ci_DNI,
    nombres: a.ci_nombres,
    apellidoPaterno: a.ci_apellido_p,
    apellidoMaterno: a.ci_apellido_m,
    domicilio: a.ci_domicilio,
    ocupacion: a.ci_ocupacion,
    hijos: a.ci_hijos,
    fechaNacimiento: a.ci_fecha_nacimiento
      ? new Date(a.ci_fecha_nacimiento).toISOString().substring(0, 10) // 👈 yyyy-MM-dd
      : '',
    telefono: a.ci_telefono,
    correoE: a.ci_correo_e,
    conocios: conocios,
    conocioOtros:conocioOtros,
  }
}
export  function MapDetalleToUpdate(vm: VMCiudadanoDetalleSimple): VMCiudadanoUpdate {
  return {
    id: vm.id,
    dni: vm.dni,
    nombres: vm.nombres,
    apellidoPaterno: vm.apellidoPaterno,
    apellidoMaterno: vm.apellidoMaterno,
    domicilio: vm.domicilio,
    ocupacion: vm.ocupacion,
    fechaNacimiento: vm.fechaNacimiento,
    hijos: vm.hijos,
    telefono: vm.telefono,
    correoE: vm.correoE,
    conocios: vm.conocios,
    conocioOtros:vm.conocioOtros,
  };
}
export function MapCiudadanoUpdateParcial(id: number,vm: VMCiudadanoUpdateForm):DTOCiudadanoUpdate{
  const dto: DTOCiudadanoUpdate = { ci_ID: id };

  if (vm.dni !== undefined) dto.ci_DNI = toUpperSafe(vm.dni);
  if (vm.nombres !== undefined) dto.ci_nombres = toUpperSafe(vm.nombres);
  if (vm.apellidoPaterno !== undefined) dto.ci_apellido_p = toUpperSafe(vm.apellidoPaterno);
  if (vm.apellidoMaterno !== undefined) dto.ci_apellido_m = toUpperSafe(vm.apellidoMaterno);
  if (vm.domicilio !== undefined) dto.ci_domicilio = toUpperSafe(vm.domicilio);
  if (vm.ocupacion !== undefined) dto.ci_ocupacion = toUpperSafe(vm.ocupacion);
  if (vm.fechaNacimiento !== undefined) dto.ci_fecha_nacimiento = new Date(vm.fechaNacimiento).toISOString();
  if (vm.hijos !== undefined) dto.ci_hijos = Number(vm.hijos);
  if (vm.telefono !== undefined) dto.ci_telefono = vm.telefono.trim();
  if (vm.correoE !== undefined) dto.ci_correo_e = vm.correoE.trim();
  if (vm.conocios !== undefined || vm.conocioOtros !== undefined) { dto.ci_conocio = conocioToDB(
        (vm.conocios as Conocio) ?? '',
        vm.conocioOtros
      );
    }
  return dto;
}

function toUpperSafe(s?: string|null): string {
  return (s ?? '').trim().toUpperCase();
}

export function MapPageToVM<TIn, TOut>(
  api: { items?: TIn[]; total?: number; page?: number; pageSize?: number },
  mapItem: (x: TIn) => TOut
): VMPage<TOut> {
  const items=(api.items??[]).map(mapItem);
  return {
    items,
    total: api.total ??items.length,
    page: api.page ??1,
    pageSize: api.pageSize ?? items.length|0,
  };
}

