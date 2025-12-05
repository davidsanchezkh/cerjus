import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, firstValueFrom } from 'rxjs';
import { API_URL } from '@/app/app.token';

import {
  ApiHorarioListaSimple,
  ApiHorarioPageSimple,
  ApiHorarioDetalle,
} from '../models/horario.api';
import {
  VMHorarioListaSimple,
  VMHorarioListaOptions,
  VMHorarioCreate,
  VMHorarioDetalle,
  VMPage,
} from '../models/horario.vm';
import {
  MapHorarioListaItemVM,
  MapHorarioListaOpciones,
  MapHorarioCreate,
  MapHorarioDetalleVM,
  MapPageToVM,
} from '../mappers/horario.mapper';
import {
  DTOHorarioListaOptions,
  DTOHorarioCreate,
} from '../models/horario.dto';
import { toHttpParams } from '@/app/components/utils/http.utils';

@Injectable({ providedIn: 'root' })
export class HorarioService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);
  private readonly base = `${this.apiUrl}/horario`;

  /** Lista paginada/filtrada de horarios */
  list(opts: VMHorarioListaOptions): Observable<VMPage<VMHorarioListaSimple>> {
    const dto: DTOHorarioListaOptions = MapHorarioListaOpciones(opts);
    const params = toHttpParams(dto);

    return this.http
      .get<ApiHorarioPageSimple>(this.base, { params })
      .pipe(
        map(apiPage =>
          MapPageToVM<ApiHorarioListaSimple, VMHorarioListaSimple>(
            apiPage,
            MapHorarioListaItemVM,
          ),
        ),
      );
  }

  /** Crear horario (POST /horario) */
  async create(vm: VMHorarioCreate): Promise<number> {
    const dto: DTOHorarioCreate = MapHorarioCreate(vm);
    const response = await firstValueFrom(
      this.http.post<{ ho_ID: number }>(this.base, dto),
    );
    return response.ho_ID;
  }

  /** Obtener detalle (GET /horario/:id) */
  getById(id: number): Observable<VMHorarioDetalle> {
    return this.http
      .get<ApiHorarioDetalle>(`${this.base}/${id}`)
      .pipe(map(api => MapHorarioDetalleVM(api)));
  }
    async update(id: number, changes: Partial<{ ho_nombre: string; ho_tz: string }>): Promise<number> {
        const response = await firstValueFrom(
            this.http.patch<{ ho_ID: number }>(`${this.base}/${id}`, {
            ho_ID: id,
            ...changes,
            }),
        );
        return response.ho_ID;
    }

  // Posteriormente podrá añadir update(), softDelete(), etc.
}
