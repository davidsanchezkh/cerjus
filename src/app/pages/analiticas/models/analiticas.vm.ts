// src/app/analiticas/models/analiticas.vm.ts
export type PeriodKind  = 'week' | 'month' | 'year';
export type PeriodRange = 'this' | 'last';
export type PeriodView  = 'day' | 'week' | 'month' | 'year';

export interface VMPeriodQuery {
  start?: string;
  end?: string;
  year?: number;
  month?: number;

  kind?: PeriodKind;
  range?: PeriodRange;
  view?: PeriodView;

  // Filtros por dimensiones (ya pensados en el backend)
  ci_id?: number;
  ci_ids?: number[];
  materia_id?: number;
  materia_ids?: number[];
  canal_id?: number;
  canal_ids?: number[];
  us_id?: number;
  us_ids?: number[];
}

/** Línea de ciudadanos (nuevos y acumulado) */
export interface VMLineaCiudadanos {
  categories: string[];     // etiquetas X
  nuevos: number[];         // serie 1
  acumulado: number[];      // serie 2
}

/** Barras apiladas (consultas + seguimientos) */
export interface VMBarrasApiladas {
  categories: string[];
  series: { name: 'Consultas' | 'Seguimientos'; data: number[] }[];
}

/** Pastel de materias */
export interface VMPastelMaterias {
  labels: string[];
  series: number[];
}

/** ETL: /etl/run o /etl (respuesta de ejecución) */
export interface VMEtlRunResponse {
  ok: boolean;
  runId?: number;
  preset?: string;
  adjustedToToday?: boolean;
  start: string;
  end: string;
}

/** ETL: status (última actualización y si hay job en curso) */
export interface VMEtlStatus {
  running: boolean;
  runId?: number | null;

  // última finalizada
  lastRunAt?: string | null;   // ISO datetime
  lastStart?: string | null;   // ISO date (inicio del rango)
  lastEnd?: string | null;     // ISO date (fin del rango)

  // si está corriendo ahora
  runningSince?: string | null;
  runningPreset?: string | null;
}

export interface VMDimMateria {
  materia_id: number;
  materia_nombre: string;
}

export interface VMDimCanal {
  canal_id: number;
  canal_nombre: string;
}

export interface VMDimUsuario {
  us_id: number;
  nombres: string;
  apellidos: string;
  activo: boolean;
}