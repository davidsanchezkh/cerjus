import { ApiAsistenciaListaSimple,ApiAsistenciaDetalleSimple } from '../models/asistencia.api';
import { VMPage, VMAsistenciaListaSimple, VMAsistenciaListaOptions,
  VMAsistenciaDetalleSimple } from '../models/asistencia.vm';
import {DTOAsistenciaListaOptions} from '../models/asistencia.dto';

//traductor entre API ↔ VM ↔ DTO.Asistencia
export function MapAsistenciaListaItemVM(a: ApiAsistenciaListaSimple):VMAsistenciaListaSimple {
  let tipo: string;
  switch (a.ma_tipo) {
    case 1:
      tipo = 'Entrada';
      break;
    case 2:
      tipo = 'Salida';
      break;
    default:
      tipo = 'Error: tipo desconocido';
  }

  return {
    idmarcaasistencia:a.ma_as_ID,
    idmarca:a.ma_ID,
    tipo,
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

  const opcionesFecha: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Lima'
  };

  const opcionesHora: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit', // 👈 ahora muestra los segundos
    hour12: false,
    timeZone: 'America/Lima'
  };

  const fechaStr = fecha.toLocaleDateString('es-PE', opcionesFecha);
  const horaStr = fecha.toLocaleTimeString('es-PE', opcionesHora);

  return `${fechaStr} ${horaStr}`;
}