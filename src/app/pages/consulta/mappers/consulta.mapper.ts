import {ApiConsultaListaGeneralSimple,ApiConsultaListaCiudadanoSimple,ApiConsultaDetalleSimple,ApiConsultaControl,ApiConsultaCiudadanoResumen,
  } from '../models/consulta.api';
import {VMPage,VMConsultaCreate,VMConsultaListaGeneralSimple,VMConsultaListaSimple,VMConsultaListaOptions,VMConsultaListaCiudadanoOptions,
  VMConsultaDetalleSimple,VMConsultaUpdate,VMConsultaUpdateForm,VMConsultaControl,VMConsultaCiudadanoResumen,} from '../models/consulta.vm';
import {DTOConsultaCreate,DTOConsultaListaOptions,DTOConsultaListaCiudadanoOptions,DTOConsultaUpdate,} from '../models/consulta.dtos';
import {llevaCasoToLabel,materiaToDB,materiaFromDB,Materia,} from '../models/consulta.dominio';

// Lista general: GET /consulta
export function MapConsultaListaGeneralItemVM(a: ApiConsultaListaGeneralSimple): VMConsultaListaGeneralSimple {
  const { materias, materiaOtros } = materiaFromDB(a.co_materia_consulta);

  return {
    id: a.co_ID,
    idciudadano: a.co_ci_ID,

    dni: a.ci_DNI ?? null,

    fecha: a.co_fecha,
    fecha_formato: formatFechaPeru(new Date(a.co_fecha)),

    materias,
    materiaOtros,
    materiaTexto: a.co_materia_consulta || '—',

    llevaCaso: a.co_lleva_caso,
    llevaCasoTexto: llevaCasoToLabel(a.co_lleva_caso),
  };
}

// Lista dentro del ciudadano: GET /consulta/ciudadano/:id
export function MapConsultaListaCiudadanoItemVM(a: ApiConsultaListaCiudadanoSimple,): VMConsultaListaSimple {
  return {
    id: a.co_ID,
    resumen: a.co_resumen,
    fecha: a.co_fecha,
    fecha_formato: formatFechaPeru(new Date(a.co_fecha)),
    llevaCaso: a.co_lleva_caso,
    llevaCasoTexto: llevaCasoToLabel(a.co_lleva_caso),
  };
}
export function MapConsultaCiudadanoResumen(a: ApiConsultaCiudadanoResumen): VMConsultaCiudadanoResumen {
  return {
    id: a.ci_ID,
    dni: a.ci_DNI,
    nombres: a.ci_nombres,
    apellidoPaterno: a.ci_apellido_p,
    apellidoMaterno: a.ci_apellido_m,
  };
}

export function MapConsultaCreate(vm: VMConsultaCreate): DTOConsultaCreate {
  return {
    co_ci_ID: vm.idciudadano,

    co_resumen: vm.resumen?.trim()
      ? toUpperSafe(vm.resumen)
      : null,

    co_hechos_consulta: toUpperSafe(vm.hechos),
    co_materia_consulta: materiaToDB(vm.materias, vm.materiaOtros),
    co_absolucion_consulta: toUpperSafe(vm.absolucion),

    co_lleva_caso: vm.llevaCaso ?? 'NO',

    co_observaciones: vm.observaciones?.trim()
      ? toUpperSafe(vm.observaciones)
      : null,

    co_fecha_registrada: vm.fechaRegistrada
      ? new Date(vm.fechaRegistrada).toISOString()
      : null,
  };
}

export function MapConsultaListaOpciones(vm: VMConsultaListaOptions): DTOConsultaListaOptions {
  const trimU = (s?: string | null) => (s ?? '').trim();

  return {
    page: vm.page,
    pageSize: vm.pageSize,
    sort: vm.sort,

    co_ID: vm.id ?? undefined,
    ci_DNI: trimU(vm.dni),

    co_materia_consulta:
    vm.materias === 'OTROS'
      ? `O:${(vm.materiaOtros ?? '').trim()}`
      : (vm.materias || undefined),

    co_lleva_caso: vm.llevaCaso || undefined,
  };
}

export function MapConsultaListaCiudadanoOpciones(vm: VMConsultaListaCiudadanoOptions,): DTOConsultaListaCiudadanoOptions {
  const trimU = (s?: string | null) => (s ?? '').trim();

  return {
    page: vm.page,
    pageSize: vm.pageSize,
    sort: vm.sort,

    co_ID: vm.id ?? undefined,
    co_resumen: trimU(vm.resumen),
    co_fecha: vm.fecha,
    co_lleva_caso: vm.llevaCaso || undefined,
  };
}

export function MapConsultaDetalleListaSimple(a: ApiConsultaDetalleSimple,): VMConsultaDetalleSimple {
  const { materias, materiaOtros } = materiaFromDB(a.co_materia_consulta);

  return {
    id: a.co_ID,
    idciudadano: a.co_ci_ID,

    dni: a.ci_DNI ?? null,
    nombres: a.ci_nombres ?? null,
    apellidoPaterno: a.ci_apellido_p ?? null,
    apellidoMaterno: a.ci_apellido_m ?? null,

    resumen: a.co_resumen ?? null,
    fecha: a.co_fecha,

    hechos: a.co_hechos_consulta,
    materias,
    materiaOtros,
    absolucion: a.co_absolucion_consulta,

    llevaCaso: a.co_lleva_caso,
    observaciones: a.co_observaciones ?? null,

    fechaRegistrada: a.co_fecha_registrada
      ? String(a.co_fecha_registrada).slice(0, 10)
      : null,
  };
}
export function MapConsultaControl(a: ApiConsultaControl): VMConsultaControl {
  return {
    id: a.co_ID,

    creadoPor: a.co_creado_por,
    creadoPorNombre: a.co_creado_por_nombre ?? null,
    creadoPorDni: a.co_creado_por_dni ?? null,
    fechaCreadoPor: a.co_fecha_creado_por,

    modificadoPor: a.co_modificado_por ?? null,
    modificadoPorNombre: a.co_modificado_por_nombre ?? null,
    modificadoPorDni: a.co_modificado_por_dni ?? null,
    fechaModificadoPor: a.co_fecha_modificado_por ?? null,
  };
}
export function MapDetalleToUpdate(vm: VMConsultaDetalleSimple): VMConsultaUpdate {
  return {
    id: vm.id,
    resumen: vm.resumen,
    hechos: vm.hechos,
    materias: vm.materias,
    materiaOtros: vm.materiaOtros,
    absolucion: vm.absolucion,
    llevaCaso: vm.llevaCaso,
    observaciones: vm.observaciones,
    fechaRegistrada: vm.fechaRegistrada,
  };
}

export function MapConsultaUpdateParcial(id: number,vm: VMConsultaUpdateForm,): DTOConsultaUpdate {
  const dto: DTOConsultaUpdate = { co_ID: id };

  // Opcional/borrable
  if (vm.resumen !== undefined) {
    dto.co_resumen = vm.resumen?.trim()
      ? toUpperSafe(vm.resumen)
      : null;
  }

  if (vm.hechos != null) dto.co_hechos_consulta = toUpperSafe(vm.hechos);
  if (vm.materias != null || vm.materiaOtros != null) {
    dto.co_materia_consulta = materiaToDB(
      (vm.materias as Materia) ?? '',
      vm.materiaOtros,
    );
  }

  if (vm.absolucion != null) dto.co_absolucion_consulta = toUpperSafe(vm.absolucion);
  if (vm.llevaCaso != null) dto.co_lleva_caso = vm.llevaCaso;

  // Opcional/borrable
  if (vm.observaciones !== undefined) {
    dto.co_observaciones = vm.observaciones?.trim()
      ? toUpperSafe(vm.observaciones)
      : null;
  }

  // Opcional/borrable
  if (vm.fechaRegistrada !== undefined) {
    dto.co_fecha_registrada = vm.fechaRegistrada
      ? new Date(vm.fechaRegistrada).toISOString()
      : null;
  }

  return dto;
}

function toUpperSafe(s?: string | null): string {
  return (s ?? '').trim().toUpperCase();
}

export function MapPageToVM<TIn, TOut>(
  api: { items?: TIn[]; total?: number; page?: number; pageSize?: number },
  mapItem: (x: TIn) => TOut,
): VMPage<TOut> {
  const items = (api.items ?? []).map(mapItem);

  return {
    items,
    total: api.total ?? items.length,
    page: api.page ?? 1,
    pageSize: api.pageSize ?? items.length | 0,
  };
}

function formatFechaPeru(fecha?: Date): string {
  if (!fecha) return '';

  const opciones: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour12: false,
    timeZone: 'America/Lima',
  };

  return fecha.toLocaleString('es-PE', opciones).replace(',', '');
}