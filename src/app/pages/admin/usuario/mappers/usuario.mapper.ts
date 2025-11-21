// src/app/pages/usuario/mappers/usuario.mapper.ts
import { ApiUsuarioListaSimple, ApiUsuarioDetalle } from '../models/usuario.api';
import {
  VMUsuarioListaSimple,
  VMUsuarioListaOptions,
  VMUsuarioDetalle,
  VMUsuarioUpdateForm,
  VMPage,
} from '../models/usuario.vm';
import {
  DTOUsuarioListaOptions,
  DTOUsuarioUpdate,
} from '../models/usuario.dtos';
import { EstadoUsuario, estadoUsuarioToLabel } from '../models/usuario.dominio';

function toUpperSafe(s?: string | null): string {
  return (s ?? '').trim().toUpperCase();
}

/** Lista simple */
export function MapUsuarioListaItemVM(a: ApiUsuarioListaSimple): VMUsuarioListaSimple {
  return {
    id: a.us_ID,
    dni: a.us_DNI,
    apellidoPaterno: a.us_apellido_p,
    apellidoMaterno: a.us_apellido_m,
    nombres: a.us_nombres,
    fechaCreadoPor: a.us_fecha_creado_por
      ? new Date(a.us_fecha_creado_por as any)
      : new Date(0),
  };
}

/** Opciones de lista (filtros) */
export function MapUsuarioListaOpciones(vm: VMUsuarioListaOptions): DTOUsuarioListaOptions {
  const trim = (s?: string) => (s ?? '').trim();

  return {
    page: vm.page,
    pageSize: vm.pageSize,
    sort: vm.sort,
    us_ID: vm.id != null ? vm.id: undefined,
    us_DNI: trim(vm.dni),
    us_apellido_p: trim(vm.apellidoPaterno),
    us_apellido_m: trim(vm.apellidoMaterno),
    us_nombres: trim(vm.nombres),
    us_estado:
      vm.estado === '' || vm.estado == null
        ? undefined
        : vm.estado,
  };
}

/** Detalle */
export function MapUsuarioDetalleVM(a: ApiUsuarioDetalle): VMUsuarioDetalle {
  const estadoNum = (a.us_estado ?? 1) as EstadoUsuario;

  return {
    id: a.us_ID,
    dni: a.us_DNI,
    nombres: a.us_nombres,
    apellidoPaterno: a.us_apellido_p,
    apellidoMaterno: a.us_apellido_m,
    telefono: a.us_telefono,
    correoE: a.us_correo_e,
    tz: a.us_tz,

    estado: estadoNum,
    estadoTexto: a.us_estado_texto ?? estadoUsuarioToLabel(estadoNum),

    rolId: a.us_tu_ID ?? a.tu_ID ?? null,
    rolNombre: a.tu_nombre ?? null,
    rolNivel: a.tu_nivel ?? null,

    creadoPor: a.us_creado_por ?? null,
    fechaCreadoPor: a.us_fecha_creado_por
      ? new Date(a.us_fecha_creado_por as any)
      : new Date(0),
    modificadoPor: a.us_modificado_por ?? null,
    fechaModificadoPor: a.us_fecha_modificado_por
      ? new Date(a.us_fecha_modificado_por as any)
      : null,
    estadoPor: a.us_estado_por ?? null,
    fechaEstadoPor: a.us_fecha_estado_por
      ? new Date(a.us_fecha_estado_por as any)
      : null,
  };
}

/** Update parcial (solo estado y rol) */
export function MapUsuarioUpdateParcial(id: number, vm: VMUsuarioUpdateForm): DTOUsuarioUpdate {
  const dto: DTOUsuarioUpdate = { us_ID: id };

  if (vm.estado !== undefined && vm.estado !== null) {
    dto.us_estado = vm.estado as EstadoUsuario;
  }

  if (vm.rolId !== undefined && vm.rolId !== null) {
    dto.us_tu_ID = vm.rolId;
  }

  return dto;
}

/** Page genérico (igual que en ciudadano) */
export function MapPageToVM<TIn, TOut>(
  api: { items?: TIn[]; total?: number; page?: number; pageSize?: number },
  mapItem: (x: TIn) => TOut
): VMPage<TOut> {
  const items = (api.items ?? []).map(mapItem);
  return {
    items,
    total: api.total ?? items.length,
    page: api.page ?? 1,
    pageSize: api.pageSize ?? (items.length || 0),
  };
}
