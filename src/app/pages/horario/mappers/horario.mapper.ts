import {
  ApiHorarioListaSimple,
  ApiHorarioDetalle,
  ApiHorarioBloque,
} from '../models/horario.api';
import {
  VMHorarioListaSimple,
  VMHorarioDetalle,
  VMHorarioBloque,
  VMHorarioCreate,
  VMHorarioBloqueForm,
  VMHorarioListaOptions,
  VMPage,
} from '../models/horario.vm';
import {
  DTOHorarioCreate,
  DTOHorarioListaOptions,
  DTOHorarioBloqueCreate,
} from '../models/horario.dto';

function toUpperSafe(s?: string | null): string {
  return (s ?? '').trim().toUpperCase();
}

/** Lista simple */
export function MapHorarioListaItemVM(a: ApiHorarioListaSimple): VMHorarioListaSimple {
  return {
    id: a.ho_ID,
    nombre: a.ho_nombre,
    tz: a.ho_tz,
    estado: a.ho_estado,
    descripcion: null, // en la lista no viene descripción
  };
}

/** Detalle */
export function MapHorarioDetalleVM(a: ApiHorarioDetalle): VMHorarioDetalle {
  const bloques: VMHorarioBloque[] = (a.bloques ?? []).map(
    (b: ApiHorarioBloque): VMHorarioBloque => ({
      id: b.hd_ID,
      dia: b.hd_dia_semana,
      horaInicio: b.hd_hora_inicio,
      horaFin: b.hd_hora_fin,
    }),
  );

  return {
    id: a.ho_ID,
    nombre: a.ho_nombre,
    tz: a.ho_tz,
    estado: a.ho_estado,
    descripcion: a.ho_descripcion ?? null,
    bloques,
    bloquesCount: a.bloquesCount ?? bloques.length,
  };
}

/** Lista opciones → DTO */
export function MapHorarioListaOpciones(vm: VMHorarioListaOptions): DTOHorarioListaOptions {
  const trim = (s?: string) => (s ?? '').trim();
  return {
    page: vm.page,
    pageSize: vm.pageSize,
    ho_ID: vm.id ?? undefined,
    ho_nombre: trim(vm.nombre) || undefined,
    ho_estado: vm.estado ?? undefined,
    sort: vm.sort,
  };
}

/** VM create → DTO create (lo que espera el backend) */
export function MapHorarioCreate(vm: VMHorarioCreate): DTOHorarioCreate {
  const bloques: DTOHorarioBloqueCreate[] = (vm.bloques ?? []).map(
    (b: VMHorarioBloqueForm): DTOHorarioBloqueCreate => ({
      dias: b.dias ?? [],
      hora_inicio: (b.horaInicio ?? '').trim(),
      hora_fin: (b.horaFin ?? '').trim(),
    }),
  );

  const tz = (vm.tz ?? '').trim();

  return {
    ho_nombre: toUpperSafe(vm.nombre),
    ho_tz: tz || undefined,    // si viene vacío, dejamos que el backend use DEFAULT_TZ
    bloques,
  };
}

/** Página genérica */
export function MapPageToVM<TIn, TOut>(
  api: { items?: TIn[]; total?: number; page?: number; pageSize?: number },
  mapItem: (x: TIn) => TOut,
): VMPage<TOut> {
  const items = (api.items ?? []).map(mapItem);
  return {
    items,
    total: api.total ?? items.length,
    page: api.page ?? 1,
    pageSize: api.pageSize ?? (items.length | 0),
  };
}
