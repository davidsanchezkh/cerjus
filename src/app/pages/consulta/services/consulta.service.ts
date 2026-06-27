import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map,Observable } from 'rxjs';
import { API_URL } from '../../../app.token'; // su token ya existente
import {firstValueFrom} from 'rxjs';

import { DTOConsultaCreate,DTOConsultaListaOptions, DTOConsultaUpdate,DTOConsultaListaCiudadanoOptions } from '../models/consulta.dtos';
import { ApiConsultaPageGeneralSimple,ApiConsultaListaGeneralSimple,ApiConsultaDetalleSimple,ApiConsultaPageCiudadanoSimple,
  ApiConsultaListaCiudadanoSimple,ApiConsultaControl,ApiConsultaCiudadanoResumen } from '../models/consulta.api';
import { VMPage, VMConsultaListaSimple,VMConsultaListaOptions,VMConsultaCreate,VMConsultaDetalleSimple, VMConsultaUpdate,
  VMConsultaListaCiudadanoOptions,VMConsultaListaGeneralSimple,VMConsultaControl,VMConsultaCiudadanoResumen } from '../models/consulta.vm';
import { MapConsultaDetalleListaSimple,MapConsultaListaGeneralItemVM, MapPageToVM,MapConsultaListaOpciones,MapConsultaCreate,
  MapConsultaUpdateParcial,MapConsultaListaCiudadanoOpciones,MapConsultaListaCiudadanoItemVM,MapConsultaControl,MapConsultaCiudadanoResumen
  } from '../mappers/consulta.mapper';
import { toHttpParams} from '@app/components/utils/http.utils';

@Injectable({ providedIn: 'root' })
export class ConsultaService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);
  private readonly base = `${this.apiUrl}/consulta`;
  private readonly base2 = `${this.apiUrl}/ciudadano`;
  /**
   * Lista general de consultas.
   * GET /consulta
   */
  list(opts: VMConsultaListaOptions): Observable<VMPage<VMConsultaListaGeneralSimple>> {
    const dto: DTOConsultaListaOptions = MapConsultaListaOpciones(opts);
    const params = toHttpParams(dto);

    return this.http
      .get<ApiConsultaPageGeneralSimple>(this.base, { params })
      .pipe(
        map(apiPage =>
          MapPageToVM<ApiConsultaListaGeneralSimple, VMConsultaListaGeneralSimple>(
            apiPage,
            MapConsultaListaGeneralItemVM,
          ),
        ),
      );
  }

  /**
   * Lista de consultas dentro del detalle de ciudadano.
   * GET /consulta/ciudadano/:id
   */
  listByCiudadano(
    idciudadano: number,
    opts: VMConsultaListaCiudadanoOptions,
  ): Observable<VMPage<VMConsultaListaSimple>> {
    const dto: DTOConsultaListaCiudadanoOptions = MapConsultaListaCiudadanoOpciones(opts);
    const params = toHttpParams(dto);

    return this.http
      .get<ApiConsultaPageCiudadanoSimple>(`${this.base}/ciudadano/${idciudadano}`, { params })
      .pipe(
        map(apiPage =>
          MapPageToVM<ApiConsultaListaCiudadanoSimple, VMConsultaListaSimple>(
            apiPage,
            MapConsultaListaCiudadanoItemVM,
          ),
        ),
      );
  }
  getResumenByDni(dni: string): Observable<VMConsultaCiudadanoResumen | null> {
    return this.http
      .get<ApiConsultaCiudadanoResumen | null>(`${this.base2}/buscar/dni/${dni}`)
      .pipe(map(apiItem => apiItem ? MapConsultaCiudadanoResumen(apiItem) : null));
  }
  async create(vm: VMConsultaCreate): Promise<number> {
    const dto: DTOConsultaCreate = MapConsultaCreate(vm);

    const response = await firstValueFrom(
      this.http.post<{ co_ID: number }>(this.base, dto),
    );

    return response.co_ID;
  }

  getById(id: number): Observable<VMConsultaDetalleSimple> {
    return this.http
      .get<ApiConsultaDetalleSimple>(`${this.base}/${id}`)
      .pipe(map(apiItem => MapConsultaDetalleListaSimple(apiItem)));
  }
  getControlById(id: number): Observable<VMConsultaControl> {
    return this.http
      .get<ApiConsultaControl>(`${this.base}/${id}/control`)
      .pipe(map(apiItem => MapConsultaControl(apiItem)));
  }
  async update(id: number, changes: Partial<VMConsultaUpdate>): Promise<number> {
    const dto: DTOConsultaUpdate = MapConsultaUpdateParcial(id, changes);

    const response = await firstValueFrom(
      this.http.patch<{ co_ID: number }>(`${this.base}/${id}`, dto),
    );

    return response.co_ID;
  }
}
