import { ApiCiudadanoListaSimple,ApiCiudadanoDetalleSimple, ApiCiudadanoControl } from '../models/ciudadano.api';
import { VMPage,VMCiudadanoCreate, VMCiudadanoListaSimple, VMCiudadanoListaOptions,
  VMCiudadanoDetalleSimple,VMCiudadanoUpdate,VMCiudadanoUpdateForm, VMCiudadanoControl } from '../models/ciudadano.vm';
import { DTOCiudadanoCreate, DTOCiudadanoListaOptions,DTOCiudadanoUpdate } from '../models/ciudadano.dtos';
import { conocioToDB,conocioFromDB,Conocio} from '../models/ciudadano.dominio';
//traductor entre API ↔ VM ↔ DTO.
export function MapCiudadanoListaItemVM(a: ApiCiudadanoListaSimple):VMCiudadanoListaSimple {
  return{
    id: a.ci_ID,
    dni: a.ci_DNI,
    apellidoPaterno: a.ci_apellido_p,
    apellidoMaterno: a.ci_apellido_m,
    nombres: a.ci_nombres,
    nacionalidad: a.ci_nacionalidad ?? '',
  };
}
export function MapCiudadanoCreate(vm: VMCiudadanoCreate): DTOCiudadanoCreate {
  return {
    ci_DNI: vm.dni.trim(),
    ci_nombres: toUpperSafe(vm.nombres),
    ci_apellido_p: toUpperSafe(vm.apellidoPaterno),
    ci_apellido_m: toUpperSafe(vm.apellidoMaterno),

    ci_domicilio: toUpperSafe(vm.domicilio),
    ci_nacionalidad: toUpperSafe(vm.nacionalidad),

    ci_direccion_actual: vm.direccionActual?.trim()
      ? toUpperSafe(vm.direccionActual)
      : null,

    ci_detalle_discapacidad: vm.detalleDiscapacidad?.trim()
      ? toUpperSafe(vm.detalleDiscapacidad)
      : null,

    ci_ocupacion: toUpperSafe(vm.ocupacion),
    ci_fecha_nacimiento: new Date(vm.fechaNacimiento).toISOString(),
    ci_hijos: Number(vm.hijos ?? 0),
    ci_telefono: vm.telefono.trim(),
    ci_correo_e: vm.correoE?.trim() || null,

    ci_conocio: toUpperSafe(
      vm.supo === 'OTROS'
        ? vm.supoOtrosDetalle.trim() || 'OTROS'
        : vm.supo
    ),

    ci_fecha_registrada:
      vm.usarFechaRegistrada && vm.fechaRegistrada
        ? new Date(vm.fechaRegistrada).toISOString()
        : null,
  };
}
export function MapCiudadanoListaOpciones(vm:VMCiudadanoListaOptions):DTOCiudadanoListaOptions{
  const trimU=(s?:string)=>(s??'').trim();
  return {
    page: vm.page,
    pageSize: vm.pageSize,
    sort: vm.sort,
    
    ci_ID:vm.id??undefined,
    ci_DNI:trimU(vm.dni),
    ci_apellido_p:trimU(vm.apellidoPaterno),
    ci_apellido_m:trimU(vm.apellidoMaterno),
    ci_nombres:trimU(vm.nombres),
    ci_nacionalidad: vm.nacionalidad ?? undefined,
  }
}
export function MapCiudadanoDetalleListaSimple(a: ApiCiudadanoDetalleSimple): VMCiudadanoDetalleSimple {
  const conocio = conocioFromDB(a.ci_conocio);

  return {
    id: a.ci_ID,
    dni: a.ci_DNI,
    nombres: a.ci_nombres,
    apellidoPaterno: a.ci_apellido_p,
    apellidoMaterno: a.ci_apellido_m,

    domicilio: a.ci_domicilio,
    nacionalidad: a.ci_nacionalidad ?? '',
    direccionActual: a.ci_direccion_actual ?? null,
    detalleDiscapacidad: a.ci_detalle_discapacidad ?? null,

    ocupacion: a.ci_ocupacion,
    fechaNacimiento: String(a.ci_fecha_nacimiento).slice(0, 10),
    hijos: a.ci_hijos,
    telefono: a.ci_telefono,
    correoE: a.ci_correo_e ?? null,

    conocios: conocio.conocios,
    conocioOtros: conocio.conocioOtros,

    fechaRegistrada: a.ci_fecha_registrada
      ? String(a.ci_fecha_registrada).slice(0, 10)
      : null,
  };
}
export function MapCiudadanoControl(a: ApiCiudadanoControl): VMCiudadanoControl {
  return {
    id: a.ci_ID,

    creadoPor: a.ci_creado_por,
    creadoPorNombre: a.ci_creado_por_nombre ?? null,
    creadoPorDni: a.ci_creado_por_dni ?? null,
    fechaCreadoPor: a.ci_fecha_creado_por,

    modificadoPor: a.ci_modificado_por ?? null,
    modificadoPorNombre: a.ci_modificado_por_nombre ?? null,
    modificadoPorDni: a.ci_modificado_por_dni ?? null,
    fechaModificadoPor: a.ci_fecha_modificado_por ?? null,
  };
}
export function MapDetalleToUpdate(vm: VMCiudadanoDetalleSimple): VMCiudadanoUpdate {
  return {
    id: vm.id,
    dni: vm.dni,
    nombres: vm.nombres,
    apellidoPaterno: vm.apellidoPaterno,
    apellidoMaterno: vm.apellidoMaterno,

    domicilio: vm.domicilio,
    nacionalidad: vm.nacionalidad,
    direccionActual: vm.direccionActual,
    detalleDiscapacidad: vm.detalleDiscapacidad,

    ocupacion: vm.ocupacion,
    fechaNacimiento: vm.fechaNacimiento,
    hijos: vm.hijos,
    telefono: vm.telefono,
    correoE: vm.correoE,

    conocios: vm.conocios,
    conocioOtros: vm.conocioOtros,

    fechaRegistrada: vm.fechaRegistrada,
  };
}
export function MapCiudadanoUpdateParcial(id: number,vm: VMCiudadanoUpdateForm):DTOCiudadanoUpdate{
  const dto: DTOCiudadanoUpdate = { ci_ID: id };

  if (vm.dni != null) dto.ci_DNI = vm.dni.trim();
  if (vm.nombres != null) dto.ci_nombres = toUpperSafe(vm.nombres);
  if (vm.apellidoPaterno != null) dto.ci_apellido_p = toUpperSafe(vm.apellidoPaterno);
  if (vm.apellidoMaterno != null) dto.ci_apellido_m = toUpperSafe(vm.apellidoMaterno);
  if (vm.domicilio != null) dto.ci_domicilio = toUpperSafe(vm.domicilio);
  if (vm.ocupacion != null) dto.ci_ocupacion = toUpperSafe(vm.ocupacion);
  if (vm.fechaNacimiento != null) dto.ci_fecha_nacimiento = new Date(vm.fechaNacimiento).toISOString();
  if (vm.hijos != null) dto.ci_hijos = Number(vm.hijos);
  if (vm.telefono != null) dto.ci_telefono = vm.telefono.trim();
  if (vm.correoE !== undefined) dto.ci_correo_e = vm.correoE?.trim() ? vm.correoE.trim() : null;
  if (vm.conocios != null || vm.conocioOtros != null) dto.ci_conocio = conocioToDB((vm.conocios as Conocio) ?? '', vm.conocioOtros);
  if (vm.nacionalidad != null) dto.ci_nacionalidad = toUpperSafe(vm.nacionalidad);
  if (vm.direccionActual !== undefined) dto.ci_direccion_actual = vm.direccionActual?.trim()? toUpperSafe(vm.direccionActual): null;

  if (vm.detalleDiscapacidad !== undefined) {dto.ci_detalle_discapacidad = vm.detalleDiscapacidad?.trim()
      ? toUpperSafe(vm.detalleDiscapacidad)
      : null;
  }

  if (vm.fechaRegistrada !== undefined) { dto.ci_fecha_registrada = vm.fechaRegistrada
      ? new Date(vm.fechaRegistrada).toISOString()
      : null;
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

