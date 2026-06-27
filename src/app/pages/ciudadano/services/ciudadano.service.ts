import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map,Observable } from 'rxjs';
import { API_URL } from '../../../app.token'; // su token ya existente
import {firstValueFrom} from 'rxjs';

import { DTOCiudadanoCreate,DTOCiudadanoListaOptions, DTOCiudadanoUpdate } from '../models/ciudadano.dtos';
import { ApiCiudadanoListaSimple, ApiCiudadanoPageSimple,ApiCiudadanoDetalleSimple,ApiCiudadanoControl } from '../models/ciudadano.api';
import { VMPage, VMCiudadanoListaSimple,VMCiudadanoListaOptions,VMCiudadanoCreate,VMCiudadanoDetalleSimple, VMCiudadanoUpdate, 
  VMCiudadanoControl } from '../models/ciudadano.vm';
import { MapCiudadanoListaItemVM, MapPageToVM,MapCiudadanoListaOpciones,MapCiudadanoCreate,MapCiudadanoDetalleListaSimple, 
  MapCiudadanoUpdateParcial,MapCiudadanoControl } from '../mappers/ciudadano.mapper';
import {toHttpParams} from '@app/components/utils/http.utils';

@Injectable({ providedIn: 'root' })
export class CiudadanoService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL); // p.ej. http://localhost:3000
  private readonly base = `${this.apiUrl}/ciudadano`;

  // ====== BÁSICOS ======

  /** Lista paginada/filtrada (para /ciudadano) */
  list(opts: VMCiudadanoListaOptions,): Observable<VMPage<VMCiudadanoListaSimple>> {
    const dto:DTOCiudadanoListaOptions=MapCiudadanoListaOpciones(opts);
    const params = toHttpParams(dto);
    return this.http
    .get<ApiCiudadanoPageSimple>(this.base,{params})
    .pipe(map(apiPage=>MapPageToVM<ApiCiudadanoListaSimple,VMCiudadanoListaSimple>(apiPage,MapCiudadanoListaItemVM)));
  }
  

  async create(vm: VMCiudadanoCreate): Promise<number> {
    const dto: DTOCiudadanoCreate = MapCiudadanoCreate(vm);
    const response = await firstValueFrom(
      this.http.post<{ ci_ID: number }>(this.base, dto)
    );

    return response.ci_ID;
  }

  getById(id: number): Observable<VMCiudadanoDetalleSimple> {
    return this.http
      .get<ApiCiudadanoDetalleSimple>(`${this.base}/${id}`)
      .pipe(map(apiItem => MapCiudadanoDetalleListaSimple(apiItem)));
  }

  getControlById(id: number): Observable<VMCiudadanoControl> {
    return this.http
      .get<ApiCiudadanoControl>(`${this.base}/${id}/control`)
      .pipe(map(apiItem => MapCiudadanoControl(apiItem)));
  }
  async update(id: number, changes: Partial<VMCiudadanoUpdate>): Promise<number> {
    const dto: DTOCiudadanoUpdate = MapCiudadanoUpdateParcial(id, changes);
    const response = await firstValueFrom(
      this.http.patch<{ ci_ID: number }>(`${this.base}/${id}`, dto)
    );
    return response.ci_ID;
  }
}
