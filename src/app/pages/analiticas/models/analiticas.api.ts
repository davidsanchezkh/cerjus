// ==== Series línea (ciudadanos) ====
export interface ApiSerieCiudadanos {
  periodo: string;  // ISO date
  nuevos: number;
  acumulado: number;
}

// ==== Series barras (atenciones) ====
export interface ApiSerieAtenciones {
  periodo: string;       // ISO date / 1er día de mes / lunes de semana
  consultas: number;
  seguimientos: number;
  total: number;
}

// ==== Pastel (materias) ====
// Tolera { materia_nombre, cantidad } o { materia, cantidad }.
export interface ApiPastelMateriasItem {
  materia_id?: number;
  materia_nombre?: string;
  materia?: string;
  cantidad: number;
}
export type ApiPastelMaterias = ApiPastelMateriasItem[];

// ==== ETL Status (shape real de tu backend) ====
export interface ApiEtlRunning {
  preset: string | null;
  status: string;
  start_date: string | Date;
  end_date: string | Date;
  year: number | null;
  month: number | null;
  started_at: string | Date;
  finished_at: string | Date | null;
  error_msg: string | null;
  id: number;
  parent_id: number | null;
}

export interface ApiEtlStatus {
  isRunning: boolean;
  running: ApiEtlRunning | null;

  lastSuccessStart: string | Date | null;
  lastSuccessEnd:   string | Date | null;
  lastSuccessAt:    string | Date | null;

  lastRunTodayAt: string | Date | null;
  minutesSinceLastRunToday: number | null;

  missingFrom: string | Date | null;
  missingTo:   string | Date | null;
  hasMissing:  boolean;

  // hay más campos en todayRange, no los usamos en el UI actual
  todayRange?: Record<string, unknown>;
}
