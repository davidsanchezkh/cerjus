import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, map, Observable } from 'rxjs';

import { API_URL } from '@/app/app.token';
import {
  ApiUsuarioHorarioPageSimple,
  ApiUsuarioHorarioListaItem,
} from '../models/usuario_horario.api';
import {
  VMUsuarioHorarioListaItem,
  VMUsuarioHorarioListaOptions,
  VMUsuarioHorarioCreate,
  VMPage,
} from '../models/usuario_horario.vm';
import {
  MapUsuarioHorarioListaItemVM,
  MapUsuarioHorarioListaOpciones,
  MapUsuarioHorarioCreate,
  MapPageToVM,
} from '../mappers/usuario_horario.mapper';
import {
  DTOUsuarioHorarioListaOptions,
  DTOUsuarioHorarioCreate,
} from '../models/usuario_horario.dto';
import { toHttpParams } from '@/app/components/utils/http.utils';

@Injectable({ providedIn: 'root' })
export class UsuarioHorarioService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);
  private readonly base = `${this.apiUrl}/usuario-horario`; // ajuste si su ruta difiere

  list(opts: VMUsuarioHorarioListaOptions): Observable<VMPage<VMUsuarioHorarioListaItem>> {
    const dto: DTOUsuarioHorarioListaOptions = MapUsuarioHorarioListaOpciones(opts);
    const params = toHttpParams(dto);
    return this.http
      .get<ApiUsuarioHorarioPageSimple>(this.base, { params })
      .pipe(
        map(apiPage =>
          MapPageToVM<ApiUsuarioHorarioListaItem, VMUsuarioHorarioListaItem>(
            apiPage,
            MapUsuarioHorarioListaItemVM,
          ),
        ),
      );
  }

  /** Lista simple de asignaciones activas para un usuario concreto */
  listByUsuario(usuarioId: number): Observable<VMUsuarioHorarioListaItem[]> {
    return this.list({
      usuarioId,
      estado: 1,
      page: 1,
      pageSize: 50,
    }).pipe(map(page => page.items));
  }

  /** Crear nueva asignación de horario a usuario */
  async create(vm: VMUsuarioHorarioCreate): Promise<number> {
    const dto: DTOUsuarioHorarioCreate = MapUsuarioHorarioCreate(vm);
    const response = await firstValueFrom(
      this.http.post<{ uh_ID: number }>(this.base, dto),
    );
    return response.uh_ID;
  }
}
