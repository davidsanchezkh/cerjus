// src/app/pages/proceso/models/proceso.dtos.ts

export interface DTOProcesoListaOptions {
  page?: number;
  pageSize?: number;
  sort?: string;

  pr_ID?: string;
  pr_co_ID?: number;
  pr_ci_ID?: number;
  pr_ci_DNI?: string;

  pr_numero_expediente?: string;
  pr_sede?: string;
  pr_parte?: string;
  pr_materia?: string;
  pr_demandado?: string;
  pr_demandante?: string;
  pr_estado_procesal?: string;

  pr_asesor_inicial_ID?: number;
  pr_asesor_actual_ID?: number;

  pr_estado?: number;
}

export interface DTOProcesoCreate {
  pr_fecha_registrada?: string;

  pr_co_ID: number;
  pr_asesor_actual_ID?: number;

  pr_numero_expediente: string;
  pr_sede: string;
  pr_parte: string;
  pr_materia: string;
  pr_demandado: string;
  pr_estado_procesal: string;
  pr_observacion?: string;
}

export interface DTOProcesoUpdate {
  pr_fecha_registrada?: string;

  pr_ID?: number;
  pr_asesor_actual_ID?: number;

  pr_numero_expediente?: string;
  pr_sede?: string;
  pr_parte?: string;
  pr_materia?: string;
  pr_demandado?: string;
  pr_demandante?: string;
  pr_estado_procesal?: string;
  pr_observacion?: string;

  pr_estado?: number;
}