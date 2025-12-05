// src/app/features/horario/models/horario.api.ts
import { DiaSemana } from './horario.dominio';

export interface ApiHorario {
  ho_ID: number;
  ho_nombre: string;
  ho_tz: string;
  ho_estado: number;
}

export interface ApiHorarioListaSimple {
  ho_ID: number;
  ho_nombre: string;
  ho_tz: string;
  ho_estado: number;
  bloquesCount: number;
}

export interface ApiHorarioBloque {
  hd_ID: number;
  hd_dia_semana: DiaSemana;
  hd_hora_inicio: string; // 'HH:mm'
  hd_hora_fin: string;    // 'HH:mm'
}

export interface ApiHorarioDetalle {
  ho_ID: number;
  ho_nombre: string;
  ho_descripcion: string | null;
  ho_tz: string;
  ho_estado: number;
  bloques: ApiHorarioBloque[];
  bloquesCount: number;
}

export interface ApiHorarioPageSimple {
  items: ApiHorarioListaSimple[];
  total: number;
  page: number;
  pageSize: number;
}
