import { ApiSeguimientoListaSimple,ApiSeguimientoDetalleSimple } from '../models/seguimiento.api';
import { VMPage,VMSeguimientoCreate, VMSeguimientoListaSimple, VMSeguimientoListaOptions,
  VMSeguimientoDetalleSimple,VMSeguimientoUpdate,VMSeguimientoUpdateForm } from '../models/seguimiento.vm';
import { DTOSeguimientoCreate, DTOSeguimientoListaOptions,DTOSeguimientoUpdate } from '../models/seguimiento.dtos';

//traductor entre API ↔ VM ↔ DTO.
export function MapSeguimientoListaItemVM(a: ApiSeguimientoListaSimple):VMSeguimientoListaSimple {
  return{
    id: a.se_ID,
    cuerposeguimiento: a.se_cuerpo_consulta,
    fechaCreadoPor:a.se_fecha_creado_por,
    fecha_formato: formatFechaPeru(new Date(a.se_fecha_creado_por)),
  };
}
export function MapSeguimientoCreate(vm:VMSeguimientoCreate):DTOSeguimientoCreate{
  return{
    se_co_ID:vm.idconsulta,
    se_cuerpo_consulta: toUpperSafe(vm.cuerposeguimiento),
  };
}
export function MapSeguimientoListaOpciones(vm:VMSeguimientoListaOptions):DTOSeguimientoListaOptions{
  const trimU=(s?:string)=>(s??'').trim();
  return {
    se_co_ID:vm.idconsulta,
    page: vm.page,
    pageSize: vm.pageSize,
  }
}
export function MapSeguimientoDetalleListaSimple(a:ApiSeguimientoDetalleSimple):VMSeguimientoDetalleSimple{
  return{
    id: a.se_ID,
    cuerposeguimiento: a.se_cuerpo_consulta,
    fechaCreadoPor: a.se_fecha_creado_por,
  }
}

export  function MapDetalleToUpdate(vm: VMSeguimientoDetalleSimple): VMSeguimientoUpdate {
  return {
    id: vm.id,
    idconsulta:vm.id,
    cuerposeguimiento:vm.cuerposeguimiento,
  };
}
export function MapSeguimientoUpdateParcial(id: number, idconsulta:number,vm: VMSeguimientoUpdateForm):DTOSeguimientoUpdate{
  const dto: DTOSeguimientoUpdate = { se_ID: id,se_co_ID:idconsulta};

  if (vm.cuerposeguimiento !== undefined) dto.se_cuerpo_consulta = toUpperSafe(vm.cuerposeguimiento);

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

function formatFechaPeru(fecha?: Date): string {
  if (!fecha) return '';

  const opciones: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour12: false,            // 24 horas
    timeZone: 'America/Lima'  // 👈 siempre Perú
  };
  
  return fecha.toLocaleString('es-PE', opciones).replace(',', '');
}