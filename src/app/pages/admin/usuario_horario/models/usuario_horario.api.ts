import { DiaSemana } from 'src/app/pages/horario/models/horario.dominio';

export interface ApiUsuarioHorarioListaItem {
  uh_ID: number;
  uh_us_ID: number;
  usuario_nombre: string;
  uh_ho_ID: number;
  horario_nombre: string;
  horario_tz: string;
  uh_desde: string | null; // ISO desde backend
  uh_hasta: string | null; // ISO desde backend
  uh_estado: number;
}

export interface ApiUsuarioHorarioDetalleBloque {
  hd_ID: number;
  hd_dia_semana: DiaSemana;
  hd_hora_inicio: string; // "HH:mm"
  hd_hora_fin: string;    // "HH:mm"
}

export interface ApiUsuarioHorarioDetail extends ApiUsuarioHorarioListaItem {
  bloques: ApiUsuarioHorarioDetalleBloque[];
}

export interface ApiUsuarioHorarioPageSimple {
  items: ApiUsuarioHorarioListaItem[];
  total: number;
  page: number;
  pageSize: number;
}
