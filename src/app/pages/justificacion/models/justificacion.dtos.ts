// justificacion.dtos.ts

import { AsistenciaJustificacionEstado, AsistenciaJustificacionTipo } from './justificacion.dominio';

export interface DTOAsistenciaJustificacionCreate {
  fecha_ymd: string; // YYYY-MM-DD
  tipo: Exclude<AsistenciaJustificacionTipo, ''>;
  motivo: string;
  detalle?: string | null;
}

export interface DTOAsistenciaJustificacionDecision {
  decision_motivo: string;
}

export type DTOAsistenciaJustificacionListaOptions = {
  page?: number;
  pageSize?: number;
  desde?: string; // YYYY-MM-DD
  hasta?: string; // YYYY-MM-DD
  tipo?: Exclude<AsistenciaJustificacionTipo, ''>;
  estado?: Exclude<AsistenciaJustificacionEstado, ''>;
  us_id?: number; // para supervisor
};
