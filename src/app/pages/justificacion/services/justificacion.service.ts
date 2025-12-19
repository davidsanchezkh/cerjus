import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, map, Observable } from 'rxjs';

import { API_URL } from '../../../app.token';
import { toHttpParams } from '@app/components/utils/http.utils';

import { ApiAsistenciaJustificacionItem, ApiPage } from '../models/justificacion.api';
import {
  VMAsistenciaJustificacionCreate,
  VMAsistenciaJustificacionItem,
  VMAsistenciaJustificacionListaOptions,
  VMPage,
} from '../models/justificacion.vm';

import { DTOAsistenciaJustificacionCreate, DTOAsistenciaJustificacionDecision, DTOAsistenciaJustificacionListaOptions } from '../models/justificacion.dtos';
import { MapJustificacionCreate, MapJustificacionItemVM, MapJustificacionListaOpciones, MapPageToVM } from '../mappers/justificacion.mapper';

@Injectable({ providedIn: 'root' })
export class JustificacionService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  // Backend: @Controller('asistencia-justificaciones')
  private readonly base = `${this.apiUrl}/asistencia-justificaciones`;

  // =========================
  // USUARIO
  // =========================

  async create(vm: VMAsistenciaJustificacionCreate): Promise<number> {
    const dto: DTOAsistenciaJustificacionCreate = MapJustificacionCreate(vm);
    const resp = await firstValueFrom(
      this.http.post<{ aj_ID: number }>(this.base, dto)
    );
    return resp.aj_ID;
  }

  listMis(opts: VMAsistenciaJustificacionListaOptions): Observable<VMPage<VMAsistenciaJustificacionItem>> {
    const dto: DTOAsistenciaJustificacionListaOptions = MapJustificacionListaOpciones(opts);
    const params = toHttpParams(dto);

    return this.http
      .get<ApiPage<ApiAsistenciaJustificacionItem>>(`${this.base}/mis`, { params })
      .pipe(map(apiPage => MapPageToVM(apiPage, MapJustificacionItemVM)));
  }

  // =========================
  // SUPERVISOR
  // =========================

  listPendientes(opts: VMAsistenciaJustificacionListaOptions): Observable<VMPage<VMAsistenciaJustificacionItem>> {
    const dto: DTOAsistenciaJustificacionListaOptions = MapJustificacionListaOpciones(opts);
    const params = toHttpParams(dto);

    return this.http
      .get<ApiPage<ApiAsistenciaJustificacionItem>>(`${this.base}/pendientes`, { params })
      .pipe(map(apiPage => MapPageToVM(apiPage, MapJustificacionItemVM)));
  }

  aprobar(id: number, decision_motivo: string) {
    const dto: DTOAsistenciaJustificacionDecision = { decision_motivo: (decision_motivo ?? '').trim() };
    return firstValueFrom(this.http.patch<{ aj_ID: number }>(`${this.base}/${id}/aprobar`, dto));
  }

  rechazar(id: number, decision_motivo: string) {
    const dto: DTOAsistenciaJustificacionDecision = { decision_motivo: (decision_motivo ?? '').trim() };
    return firstValueFrom(this.http.patch<{ aj_ID: number }>(`${this.base}/${id}/rechazar`, dto));
  }
}
