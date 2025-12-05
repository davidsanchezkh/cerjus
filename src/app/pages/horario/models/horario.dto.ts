// src/app/features/horario/models/horario.dtos.ts
import { DiaSemana } from './horario.dominio';

export interface DTOHorarioListaOptions {
  page?: number;
  pageSize?: number;
  ho_ID?: number; 
  ho_nombre?: string;
  ho_estado?: number;
  sort?: string;
}

/** Bloque que espera el backend para crear un horario */
export interface DTOHorarioBloqueCreate {
  dias: DiaSemana[];
  hora_inicio: string; 
  hora_fin: string;   
}

/** DTO para crear un horario */
export interface DTOHorarioCreate {
  ho_nombre: string;
  ho_tz?: string;
  ho_descripcion?: string;
  bloques: DTOHorarioBloqueCreate[];
}
