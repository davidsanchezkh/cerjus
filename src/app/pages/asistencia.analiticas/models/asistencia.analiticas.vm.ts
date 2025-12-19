export type AsistenciaPeriodKind = 'week' | 'month' | 'year';
export type AsistenciaPeriodRange = 'this' | 'last';

export interface VMAsistenciaQuery {
  kind?: AsistenciaPeriodKind;
  range?: AsistenciaPeriodRange;
}

export interface VMAsistenciaCards {
  totalProgramadosHoy: number;
  asistenciasHoy: number;
  tardanzasHoy: number;
  ausentesHoy: number;
  incompletosAyer: number;
}

export interface VMBarrasAsistencia {
  categories: string[];
  series: {
    name: 'A tiempo' | 'Tarde' | 'Ausente' | 'Incompleto'| 'Programado';
    data: number[];
  }[];
  granularity: 'DAY' | 'MONTH';
}

export type VMEstadoAsistencia =
  | 'PENDIENTE'
  | 'A_TIEMPO'
  | 'TARDE'
  | 'AUSENTE'
  | 'INCOMPLETO'
  | 'SIN_HORARIO'
  | 'NO_INICIA'
  | 'FUERA_HORARIO';

export interface VMEstadoActualRow {
  fechaYmd: string;     // para segmentación/orden
  fechaLabel: string;   // “jue, 18 dic.”
  usId: number;
  nombre: string;

  horario: string;      // “Con horario”
  horaInicio: string | null;    // "HH:mm"
  primeraMarca: string | null;  // "HH:mm"

  estado: VMEstadoAsistencia;
  estadoLabel: string;
  estadoBadgeClass: string;
}

export interface VMAsistenciaDashboard {
  cards: VMAsistenciaCards;
  barras: VMBarrasAsistencia;

  fechaDesde: string;
  fechaHasta: string;

  countHoy: number;
  countAnteriores: number;
  countProximos: number;
}

export interface VMAsistenciaPeriodoPage {
  segment: 'anteriores' | 'hoy' | 'proximos';
  page: number;
  pageSize: number;
  total: number;

  countHoy: number;
  countAnteriores: number;
  countProximos: number;

  items: VMEstadoActualRow[];
}
