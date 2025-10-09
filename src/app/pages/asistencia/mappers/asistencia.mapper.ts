import { ApiAsistenciaListaSimple,ApiAsistenciaDetalleSimple } from '../models/asistencia.api';
import { VMPage, VMAsistenciaListaSimple, VMAsistenciaListaOptions,
  VMAsistenciaDetalleSimple } from '../models/asistencia.vm';
import {DTOAsistenciaListaOptions} from '../models/asistencia.dto';

//traductor entre API ↔ VM ↔ DTO.Asistencia
export function MapAsistenciaListaItemVM(a: ApiAsistenciaListaSimple):VMAsistenciaListaSimple {
  return{
    tipo: a.ma_tipo,
    fecha_formato: formatFechaPeru(new Date(a.ma_fecha)),
  };
}

export function MapAsistenciaListaOpciones(vm:VMAsistenciaListaOptions):DTOAsistenciaListaOptions{
  const trimU=(s?:string)=>(s??'').trim();
  return {
    page: vm.page,
    pageSize: vm.pageSize,
  }
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

function formatFechaPeru(fecha?: Date): string {
  if (!fecha) return '';

  const opciones: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour12: false,           
    timeZone: 'America/Lima'  
  };
  
  return fecha.toLocaleString('es-PE', opciones).replace(',', '');
}