// src/app/pages/asistencia.analiticas/models/asistencia.analiticas.vm.ts

// Periodos que puede elegir en el dashboard
export type AsistenciaPeriodKind = 'week' | 'month' | 'year';
export type AsistenciaPeriodRange = 'this' | 'last';

// Query que enviamos desde el formulario Angular al servicio
export interface VMAsistenciaQuery {
  kind?: AsistenciaPeriodKind;
  range?: AsistenciaPeriodRange;
}

// Cards superiores
export interface VMAsistenciaCards {
  totalProgramadosHoy: number;
  asistenciasHoy: number;
  tardanzasHoy: number;
  ausentesHoy: number;
  incompletosAyer: number;
}

// Barras apiladas por día
export interface VMBarrasAsistencia {
  categories: string[]; // etiquetas X (días)
  series: {
    name: 'A tiempo' | 'Tarde' | 'Ausente' | 'Incompleto';
    data: number[];
  }[];
}

// Estado actual (tabla)
export type VMEstadoAsistencia =
  | 'A_TIEMPO'
  | 'TARDE'
  | 'AUSENTE'
  | 'INCOMPLETO'
  | 'SIN_HORARIO'
  | 'NO_INICIA'
  | 'FUERA_HORARIO';

export interface VMEstadoActualRow {
  usId: number;
  nombre: string;
  horario: string;
  horaInicio: string | null;
  primeraMarca: string | null;
  estado: VMEstadoAsistencia;
  estadoLabel: string;      // Texto legible
  estadoBadgeClass: string; // Clase CSS para badge
}

// VM global del dashboard
export interface VMAsistenciaDashboard {
  cards: VMAsistenciaCards;
  barras: VMBarrasAsistencia;
  estadoActual: VMEstadoActualRow[];

  fechaDesde: string;  // ISO
  fechaHasta: string;  // ISO
}
