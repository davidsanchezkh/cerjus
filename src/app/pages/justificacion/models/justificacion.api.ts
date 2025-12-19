// justificacion.api.ts

export interface ApiAsistenciaJustificacionItem {
  aj_ID: number;
  aj_us_ID: number;

  aj_fecha_ymd: string; // YYYY-MM-DD (ya viene así en su service backend)
  aj_tz: string;

  aj_tipo: 'TARDANZA' | 'SIN_MARCA' | 'NO_PROGRAMADO';
  aj_resultado: 'JUSTIFICADO_LLEGO_A_TIEMPO' | 'JUSTIFICADO_ASISTIO' | 'JUSTIFICADO_NO_PROGRAMADO';
  aj_estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  aj_incidencia?: 'TARDE' | 'AUSENTE' | 'INCOMPLETO' | null;

  aj_motivo: string;
  aj_detalle?: string | null;

  aj_as_ID?: number | null;
  aj_uh_ID?: number | null;

  aj_aprobado_por?: number | null;
  aj_aprobado_en?: string | null;
  aj_decision_motivo?: string | null;

  aj_creado_por: number;
  aj_creado_en: string;
}

export interface ApiPage<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
