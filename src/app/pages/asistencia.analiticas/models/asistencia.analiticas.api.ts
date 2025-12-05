// src/app/pages/asistencia.analiticas/models/asistencia.analiticas.api.ts

// === Coincide con el JSON real del backend /asistencia-analytics/dashboard-rango ===

// Fila cruda que devuelve el backend (AsistenciaDiaUsuarioResponse)
export interface ApiAsistenciaDiaUsuario {
  fecha_ymd: string;        // "YYYY-MM-DD"
  us_id: number;
  nombre: string;

  tuvo_horario: boolean;
  asistio: boolean;
  fue_tarde: boolean;
  tardanza_min: number | null;
  fue_ausente: boolean;
  incompleto: boolean;

  // NUEVO: hora de la primera marca "HH:mm" o null
  hora_primera_marca: string | null;
}

// Respuesta completa (AsistenciaDashboardRangoResponse)
export interface ApiAsistenciaDashboardResponse {
  desde: string;                    // "YYYY-MM-DD"
  hasta: string;                    // "YYYY-MM-DD"
  items: ApiAsistenciaDiaUsuario[]; // filas por día/usuario
}

// Estados derivados que usaremos en el VM (no vienen del backend,
// los calcularemos en el mapper a partir de las banderas booleanas).
export type ApiEstadoAsistencia =
  | 'A_TIEMPO'
  | 'TARDE'
  | 'AUSENTE'
  | 'INCOMPLETO'
  | 'SIN_HORARIO'
  | 'NO_INICIA'
  | 'FUERA_HORARIO';
