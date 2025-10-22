import { ApiConsultaListaSimple,ApiConsultaDetalleSimple } from '../models/consulta.api';
import { VMPage,VMConsultaCreate, VMConsultaListaSimple, VMConsultaListaOptions,
  VMConsultaDetalleSimple,VMConsultaUpdate,VMConsultaUpdateForm } from '../models/consulta.vm';
import { DTOConsultaCreate, DTOConsultaListaOptions,DTOConsultaUpdate } from '../models/consulta.dtos';
import { estadoConsultaToLabel,EstadoConsulta,materiaToDB,materiaFromDB,Materia} from '../models/consulta.dominio';

//traductor entre API ↔ VM ↔ DTO.
export function MapConsultaListaItemVM(a: ApiConsultaListaSimple): VMConsultaListaSimple {
  const estado = a.co_estado as EstadoConsulta; // backend solo 1|2
  return {
    id: a.co_ID,
    resumen: a.co_resumen,
    fecha: a.co_fecha,
    fecha_formato: formatFechaPeru(new Date(a.co_fecha)),
    estado,
    estadotexto: estadoConsultaToLabel(estado),
  };
}
export function MapConsultaCreate(vm:VMConsultaCreate):DTOConsultaCreate{
  return{
    co_ci_ID: vm.idciudadano,
    co_resumen: toUpperSafe(vm.resumen),
    co_hechos_consulta: toUpperSafe(vm.hechos),
    co_regresa:toUpperSafe(vm.regresa),
    co_materia_consulta: materiaToDB(vm.materias, vm.materiaOtros),
    co_absolucion_consulta: toUpperSafe(vm.absolucion),
  };
}
export function MapConsultaListaOpciones(vm:VMConsultaListaOptions):DTOConsultaListaOptions{
  const trimU=(s?:string)=>(s??'').trim();
  return {
    page: vm.page,
    pageSize: vm.pageSize,
    co_ID:vm.id??undefined,
    co_ci_ID:vm.idciudadano,
    co_fecha:vm.fecha,
    co_resumen:vm.resumen,
    co_estado:vm.estado,
  }
}
export function MapConsultaDetalleListaSimple(a:ApiConsultaDetalleSimple):VMConsultaDetalleSimple{
  const { materias, materiaOtros } = materiaFromDB(a.co_materia_consulta);
  return{
    ciudadanodni:a.ci_DNI,
    id: a.co_ID,
    idciudadano:a.co_ci_ID,
    resumen: a.co_resumen,
    fecha: a.co_fecha,
    regresa: a.co_regresa,
    hechos: a.co_hechos_consulta,
    materias: materias,
    materiaOtros:materiaOtros,
    absolucion: a.co_absolucion_consulta,
    estado: a.co_estado,
  }
}

export  function MapDetalleToUpdate(vm: VMConsultaDetalleSimple): VMConsultaUpdate {
  return {
    id: vm.id,
    resumen: vm.resumen,
    hechos: vm.hechos,
    materias: vm.materias,
    materiaOtros:vm.materiaOtros,
    absolucion: vm.absolucion,
    estado: vm.estado,
  };
}
export function MapConsultaUpdateParcial(id: number,vm: VMConsultaUpdateForm):DTOConsultaUpdate{
  const dto: DTOConsultaUpdate = { co_ID: id };

  if (vm.resumen !== undefined) dto.co_resumen = toUpperSafe(vm.resumen);
  if (vm.hechos !== undefined) dto.co_hechos_consulta = toUpperSafe(vm.hechos);
  if (vm.materias !== undefined || vm.materiaOtros !== undefined) { dto.co_materia_consulta = materiaToDB(
      (vm.materias as Materia) ?? '',
      vm.materiaOtros
    );
  }
  if (vm.absolucion !== undefined) dto.co_absolucion_consulta = toUpperSafe(vm.absolucion);
  if (vm.estado !== undefined) dto.co_estado = vm.estado;

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