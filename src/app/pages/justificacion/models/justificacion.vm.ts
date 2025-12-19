// justificacion.vm.ts

import {
  AsistenciaJustificacionTipo,
  AsistenciaJustificacionEstado,
  AsistenciaJustificacionIncidencia,
  AsistenciaJustificacionResultado,
  AsistenciaJustificacionTipoFiltro
} from './justificacion.dominio';

export interface VMPage<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type VMAsistenciaJustificacionCreate = {
  fecha_ymd: string; // YYYY-MM-DD
  tipo: AsistenciaJustificacionTipo;
  motivo: string;
  detalle?: string | null;
};

export interface VMAsistenciaJustificacionItem {
  aj_ID: number;
  us_id: number;

  fecha_ymd: string;
  fecha_label?: string;

  tipo: AsistenciaJustificacionTipo;
  tipo_label?: string;

  estado: AsistenciaJustificacionEstado;
  estado_label?: string;

  resultado?: AsistenciaJustificacionResultado | null;
  resultado_label?: string;

  incidencia?: AsistenciaJustificacionIncidencia | null;

  motivo: string;
  detalle?: string | null;

  aprobado_por?: number | null;
  aprobado_en?: string | null;
  decision_motivo?: string | null;

  creado_en?: string;
}

export type VMAsistenciaJustificacionListaOptions = {
  page?: number;
  pageSize?: number;
  desde?: string;
  hasta?: string;
  tipo?: AsistenciaJustificacionTipoFiltro; 
  estado?: AsistenciaJustificacionEstado;
  us_id?: number;
};
