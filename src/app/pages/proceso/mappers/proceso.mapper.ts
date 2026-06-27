// src/app/pages/proceso/mappers/proceso.mapper.ts

import {ApiProcesoListaSimple,ApiProcesoDetalleSimple,ApiProcesoControl,ApiProcesoAsesorActual } from '../models/proceso.api';

import {VMPage,VMProcesoCreate,VMProcesoDetalleSimple,VMProcesoListaOptions,VMProcesoListaSimple,VMProcesoUpdate,VMProcesoControl,
    VMProcesoAsesorActual,} from '../models/proceso.vm';

import {DTOProcesoCreate,DTOProcesoListaOptions,DTOProcesoUpdate,} from '../models/proceso.dtos';

import { procesoEstadoToLabel } from '../models/proceso.dominio';

export function MapProcesoListaItemVM(a: ApiProcesoListaSimple): VMProcesoListaSimple {
    return {
        id: a.pr_ID,
        idconsulta: a.pr_co_ID,
        idciudadano: a.pr_ci_ID,
        dni: a.pr_ci_DNI,

        asesorInicialId: a.pr_asesor_inicial_ID,
        asesorInicialNombre: a.pr_asesor_inicial_nombre ?? null,

        asesorActualId: a.pr_asesor_actual_ID ?? null,
        asesorActualNombre: a.pr_asesor_actual_nombre ?? null,

        numeroExpediente: a.pr_numero_expediente,
        sede: a.pr_sede,
        parte: a.pr_parte,
        materia: a.pr_materia,
        demandado: a.pr_demandado,
        demandante: a.pr_demandante,
        estadoProcesal: a.pr_estado_procesal ,
        observacion: a.pr_observacion ?? null,

    };
}
export function MapProcesoAsesorActual(a: ApiProcesoAsesorActual): VMProcesoAsesorActual {
    return {
        id: a.pr_ID,
        asesorActualId: a.pr_asesor_actual_ID,
        asesorActualNombre: a.pr_asesor_actual_nombre ?? null,
    };
}
export function MapProcesoDetalleVM(a: ApiProcesoDetalleSimple): VMProcesoDetalleSimple {
    return {
        ...MapProcesoListaItemVM(a),

        creadoPor: a.pr_creado_por,
        fechaCreadoPor: a.pr_fecha_creado_por,

        modificadoPor: a.pr_modificado_por ?? null,
        fechaModificadoPor: a.pr_fecha_modificado_por ?? null,

        estadoPor: a.pr_estado_por ?? null,
        fechaEstadoPor: a.pr_fecha_estado_por ?? null,
    };
}
export function MapProcesoControl(a: ApiProcesoControl): VMProcesoControl {
    return {
        id: a.pr_ID,

        creadoPor: a.pr_creado_por,
        creadoPorNombre: a.pr_creado_por_nombre ?? null,
        creadoPorDni: a.pr_creado_por_dni ?? null,
        fechaCreadoPor: a.pr_fecha_creado_por,

        modificadoPor: a.pr_modificado_por ?? null,
        modificadoPorNombre: a.pr_modificado_por_nombre ?? null,
        modificadoPorDni: a.pr_modificado_por_dni ?? null,
        fechaModificadoPor: a.pr_fecha_modificado_por ?? null,

        estadoPor: a.pr_estado_por ?? null,
        estadoPorNombre: a.pr_estado_por_nombre ?? null,
        estadoPorDni: a.pr_estado_por_dni ?? null,
        fechaEstadoPor: a.pr_fecha_estado_por ?? null,
    };
}

export function MapProcesoListaOpciones(vm: VMProcesoListaOptions): DTOProcesoListaOptions {
  const trimU = (s?: string | null) => (s ?? '').trim();

    return {
        page: vm.page,
        pageSize: vm.pageSize,
        sort: vm.sort,

        pr_ID: vm.id != null ? String(vm.id) : undefined,
        pr_co_ID: vm.idconsulta ?? undefined,
        pr_ci_ID: vm.idciudadano ?? undefined,
        pr_ci_DNI: trimU(vm.dni),

        pr_numero_expediente: trimU(vm.numeroExpediente),
        pr_sede: trimU(vm.sede),
        pr_parte: trimU(vm.parte),
        pr_materia: trimU(vm.materia),
        pr_demandado: trimU(vm.demandado),
        pr_demandante: trimU(vm.demandante),
        pr_estado_procesal: trimU(vm.estadoProcesal),

        pr_asesor_inicial_ID: vm.asesorInicialId ?? undefined,
        pr_asesor_actual_ID: vm.asesorActualId ?? undefined,

    };
}

export function MapProcesoCreate(vm: VMProcesoCreate): DTOProcesoCreate {
    const dto: DTOProcesoCreate = {
        pr_co_ID: vm.idconsulta,

        pr_numero_expediente: toUpperSafeRequired(vm.numeroExpediente),

        pr_sede: toUpperSafeRequired(vm.sede),
        pr_parte: toUpperSafeRequired(vm.parte),
        pr_materia: toUpperSafeRequired(vm.materia),
        pr_demandado: toUpperSafeRequired(vm.demandado),
        pr_estado_procesal: toUpperSafeRequired(vm.estadoProcesal),
        pr_observacion: optionalUpper(vm.observacion),
    };

    if (vm.asesorActualId != null) {
        dto.pr_asesor_actual_ID = vm.asesorActualId;
    }

    if (vm.fechaRegistrada) {
        dto.pr_fecha_registrada = new Date(vm.fechaRegistrada).toISOString();
    }

    return dto;
}

export function MapProcesoUpdateParcial(_id: number,vm: Partial<VMProcesoUpdate>,): DTOProcesoUpdate {
    const dto: DTOProcesoUpdate = {};

    if (vm.asesorActualId != null) dto.pr_asesor_actual_ID = vm.asesorActualId;
    if (vm.numeroExpediente != null) dto.pr_numero_expediente = toUpperSafeRequired(vm.numeroExpediente);
    if (vm.sede != null) dto.pr_sede = toUpperSafeRequired(vm.sede);
    if (vm.parte != null) dto.pr_parte = toUpperSafeRequired(vm.parte);
    if (vm.materia != null) dto.pr_materia = toUpperSafeRequired(vm.materia);
    if (vm.demandado != null) dto.pr_demandado = toUpperSafeRequired(vm.demandado);
    if (vm.estadoProcesal != null) dto.pr_estado_procesal = toUpperSafeRequired(vm.estadoProcesal);
    if (vm.observacion != null) dto.pr_observacion = optionalUpper(vm.observacion);

    if (vm.fechaRegistrada) {
        dto.pr_fecha_registrada = new Date(vm.fechaRegistrada).toISOString();
    }

    return dto;
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

function toUpperSafeRequired(s?: string | null): string {
    const v = (s ?? '').trim();

    if (!v) {
        throw new Error('Hay campos obligatorios vacíos.');
    }
    return v.toUpperCase();
}

function optionalUpper(s?: string | null): string | undefined {
    const v = (s ?? '').trim();
    return v ? v.toUpperCase() : undefined;
}