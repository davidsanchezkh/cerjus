// src/app/pages/proceso/models/proceso.api.ts

export interface ApiProceso {
  pr_ID: number;
  pr_co_ID: number;
  pr_ci_ID: number;
  pr_ci_DNI: string;

  pr_asesor_inicial_ID: number;
  pr_asesor_inicial_nombre?: string | null;

  pr_asesor_actual_ID?: number | null;
  pr_asesor_actual_nombre?: string | null;

  pr_numero_expediente: string;
  pr_sede: string;
  pr_parte: string;
  pr_materia: string;
  pr_demandado: string;
  pr_demandante: string;
  pr_estado_procesal: string;
  pr_observacion?: string | null;

  pr_creado_por?: number;
  pr_fecha_creado_por?: Date | string;
  pr_modificado_por?: number | null;
  pr_fecha_modificado_por?: Date | string | null;
  pr_estado_por?: number | null;
  pr_fecha_estado_por?: Date | string | null;
}

export type ApiProcesoListaSimple = Pick<
  ApiProceso,
  | 'pr_ID'
  | 'pr_co_ID'
  | 'pr_ci_ID'
  | 'pr_ci_DNI'
  | 'pr_asesor_inicial_ID'
  | 'pr_asesor_inicial_nombre'
  | 'pr_asesor_actual_ID'
  | 'pr_asesor_actual_nombre'
  | 'pr_numero_expediente'
  | 'pr_sede'
  | 'pr_parte'
  | 'pr_materia'
  | 'pr_demandado'
  | 'pr_demandante'
  | 'pr_estado_procesal'
  | 'pr_observacion'
>;

export type ApiProcesoDetalleSimple = ApiProceso;

export interface ApiProcesoPageSimple {
  items: ApiProcesoListaSimple[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiProcesoControl {
  pr_ID: number;

  pr_creado_por: number;
  pr_creado_por_nombre?: string | null;
  pr_creado_por_dni?: string | null;
  pr_fecha_creado_por: Date | string;

  pr_modificado_por?: number | null;
  pr_modificado_por_nombre?: string | null;
  pr_modificado_por_dni?: string | null;
  pr_fecha_modificado_por?: Date | string | null;

  pr_estado_por?: number | null;
  pr_estado_por_nombre?: string | null;
  pr_estado_por_dni?: string | null;
  pr_fecha_estado_por?: Date | string | null;
}
export interface ApiProcesoAsesorActual {
  pr_ID: number;
  pr_asesor_actual_ID: number;
  pr_asesor_actual_nombre?: string | null;
}