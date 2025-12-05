// src/app/features/horario/models/horario.vm.ts
import { DiaSemana } from './horario.dominio';

export interface VMHorario {
  id: number;
  nombre: string;
  tz: string;
  estado: number;
  descripcion?: string | null;
}

export type VMHorarioListaSimple = VMHorario;

export interface VMHorarioBloque {
  id: number;
  dia: DiaSemana;
  horaInicio: string;  // 'HH:mm'
  horaFin: string;     // 'HH:mm'
}

export interface VMHorarioDetalle extends VMHorario {
  bloques: VMHorarioBloque[];
  bloquesCount: number;
}

/** Bloque tal como se edita en el formulario de creación */
export interface VMHorarioBloqueForm {
  dias: DiaSemana[];   // varios días con el mismo rango horario
  horaInicio: string;  // input[type="time"] => 'HH:mm'
  horaFin: string;
}

/** Datos que la UI envía al crear un horario */
export interface VMHorarioCreate {
  nombre: string;
  tz: string;
  bloques: VMHorarioBloqueForm[];
}

/** Página genérica */
export interface VMPage<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Opciones de listado (filtros + paginación) */
export interface VMHorarioListaOptions {
  page?: number;
  pageSize?: number;
  id?: number;
  nombre?: string;
  estado?: number;
  sort?: string;
}
