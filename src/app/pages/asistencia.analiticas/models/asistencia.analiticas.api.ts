export type ApiBarName =
  | 'A tiempo'
  | 'Tarde'
  | 'Ausente'
  | 'Incompleto'
  | 'Programado';

export type ApiGranularity = 'DAY' | 'MONTH';

export interface ApiAsistenciaCards {
  totalProgramadosHoy: number;
  asistenciasHoy: number;
  tardanzasHoy: number;
  ausentesHoy: number;
  incompletosAyer: number;
}

export interface ApiAsistenciaBarras {
  granularity: ApiGranularity;
  categories: string[]; // DAY: YYYY-MM-DD | MONTH: YYYY-MM
  series: { name: ApiBarName; data: number[] }[];
}

export interface ApiAsistenciaDashboardResponse {
  desde: string;
  hasta: string;
  cards: ApiAsistenciaCards;
  barras: ApiAsistenciaBarras;

  countHoy: number;
  countAnteriores: number;
  countProximos: number;
}

export type ApiEstadoAsistencia =
  | 'PENDIENTE'
  | 'A_TIEMPO'
  | 'TARDE'
  | 'AUSENTE'
  | 'INCOMPLETO'
  | 'SIN_HORARIO'
  | 'NO_INICIA'
  | 'FUERA_HORARIO';

export interface ApiAsistenciaDiaUsuario {
  fecha_ymd: string;        // "YYYY-MM-DD"
  us_id: number;
  nombre: string;

  tuvo_horario: boolean;

  hora_inicio_programada: string | null; // "HH:mm"
  hora_primera_marca: string | null;

  asistio: boolean;
  fue_tarde: boolean;
  tardanza_min: number | null;
  fue_ausente: boolean;
  incompleto: boolean;

  es_futuro: boolean;
  es_pendiente: boolean;
}

export type ApiTablaSegmento = 'anteriores' | 'hoy' | 'proximos';

export interface ApiAsistenciaPeriodoPageResponse {
  desde: string;
  hasta: string;

  segment: ApiTablaSegmento;
  page: number;
  pageSize: number;
  total: number;

  countHoy: number;
  countAnteriores: number;
  countProximos: number;

  items: ApiAsistenciaDiaUsuario[];
}
