// src/app/features/usuario_horario/services/usuario_horario.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, map, Observable } from 'rxjs';

import { API_URL } from '@/app/app.token';
import {
  ApiUsuarioHorarioPageSimple,
  ApiUsuarioHorarioListaItem,
  ApiUsuarioHorarioDetail,
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
  DTOUsuarioHorarioUpdate,
} from '../models/usuario_horario.dto';
import { toHttpParams } from '@/app/components/utils/http.utils';

@Injectable({ providedIn: 'root' })
export class UsuarioHorarioService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);
  private readonly base = `${this.apiUrl}/usuario-horario`;

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

  /** Asignaciones activas (estado=1) */
  listAllByUsuario(usuarioId: number): Observable<VMUsuarioHorarioListaItem[]> {
    return this.list({
      usuarioId,
      incluirEliminados: true,
      page: 1,
      pageSize: 50,
      // estado: undefined => no filtra
    }).pipe(map(page => page.items ?? []));
  }

  /** Reactivar: PATCH /usuario-horario/:id con uh_estado=1 */
  async deactivate(id: number): Promise<void> {
    await firstValueFrom(
      this.http.patch(`${this.base}/${id}/desactivar`, {}),
    );
  }

  async reactivate(id: number): Promise<void> {
    await this.update(id, { uh_ID: id, uh_estado: 1 });
  }

  /** Crear nueva asignación */
  async create(vm: VMUsuarioHorarioCreate): Promise<number> {
    const dto: DTOUsuarioHorarioCreate = MapUsuarioHorarioCreate(vm);
    const response = await firstValueFrom(
      this.http.post<{ uh_ID: number }>(this.base, dto),
    );
    return response.uh_ID;
  }

  /** Actualizar rango/estado (PATCH /usuario-horario/:id) */
  async update(id: number, patch: DTOUsuarioHorarioUpdate): Promise<void> {
    await firstValueFrom(
      this.http.patch(`${this.base}/${id}`, patch),
    );
  }


}
