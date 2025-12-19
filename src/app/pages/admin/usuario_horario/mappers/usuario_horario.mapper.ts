import { ApiUsuarioHorarioListaItem } from '../models/usuario_horario.api';
import {
  VMUsuarioHorarioListaItem,
  VMUsuarioHorarioCreate,
  VMUsuarioHorarioListaOptions,
  VMPage,
} from '../models/usuario_horario.vm';
import {
  DTOUsuarioHorarioCreate,
  DTOUsuarioHorarioListaOptions,
} from '../models/usuario_horario.dto';
import { estadoUsuarioHorarioToLabel } from '../models/usuario_horario.dominio';

function toYmd(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function ymdToDisplay(ymd: string | null): string {
  if (!ymd) return '';
  const [yyyy, mm, dd] = ymd.split('-');
  if (!yyyy || !mm || !dd) return '';
  return `${dd}/${mm}/${yyyy}`;
}

export function MapUsuarioHorarioListaItemVM(
  a: ApiUsuarioHorarioListaItem,
): VMUsuarioHorarioListaItem {
  const desdeYmd = toYmd(a.uh_desde);
  const hastaYmd = toYmd(a.uh_hasta);

  const desdeTxt = ymdToDisplay(desdeYmd);
  const hastaTxt = ymdToDisplay(hastaYmd);

  let vigencia: string;
  if (desdeYmd && hastaYmd) {
    vigencia = `${desdeTxt} – ${hastaTxt}`;
  } else if (desdeYmd) {
    vigencia = `Desde ${desdeTxt}`;
  } else if (hastaYmd) {
    vigencia = `Hasta ${hastaTxt}`;
  } else {
    vigencia = 'Sin rango definido';
  }

  const estadoTexto = estadoUsuarioHorarioToLabel(a.uh_estado);

  return {
    id: a.uh_ID,
    usuarioId: a.uh_us_ID,
    usuarioNombre: a.usuario_nombre,
    horarioId: a.uh_ho_ID,
    horarioNombre: a.horario_nombre,
    horarioTz: a.horario_tz,
    desde: desdeYmd,
    hasta: hastaYmd,
    vigenciaTexto: vigencia,
    estado: a.uh_estado,
    estadoTexto,
  };
}

export function MapUsuarioHorarioListaOpciones(
  vm: VMUsuarioHorarioListaOptions,
): DTOUsuarioHorarioListaOptions {
  return {
    page: vm.page ?? 1,
    pageSize: vm.pageSize ?? 50,
    uh_us_ID: vm.usuarioId,
    uh_estado: vm.estado, // normalmente undefined si quieres TODO
    incluirEliminados: vm.incluirEliminados ?? false,
  };
}

export function MapUsuarioHorarioCreate(
  vm: VMUsuarioHorarioCreate,
): DTOUsuarioHorarioCreate {
  return {
    uh_us_ID: vm.usuarioId,
    uh_ho_ID: vm.horarioId,
    uh_desde: vm.desde || undefined,
    uh_hasta: vm.hasta || undefined,
    cerrarAnterior: vm.cerrarAnterior,
  };
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
    pageSize: api.pageSize ?? (items.length || 0),
  };
}
