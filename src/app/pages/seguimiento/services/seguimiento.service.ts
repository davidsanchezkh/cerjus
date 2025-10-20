import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map,Observable } from 'rxjs';
import { API_URL } from '../../../app.token'; // su token ya existente
import {firstValueFrom} from 'rxjs';

import { DTOSeguimientoCreate,DTOSeguimientoListaOptions, DTOSeguimientoUpdate } from '../models/seguimiento.dtos';
import { ApiSeguimientoListaSimple, ApiSeguimientoPageSimple,ApiSeguimientoDetalleSimple } from '../models/seguimiento.api';
import { VMPage, VMSeguimientoListaSimple,VMSeguimientoListaOptions,
  VMSeguimientoCreate,VMSeguimientoDetalleSimple, VMSeguimientoUpdate } from '../models/seguimiento.vm';
import { MapSeguimientoDetalleListaSimple,MapSeguimientoListaItemVM, MapPageToVM,
  MapSeguimientoListaOpciones,MapSeguimientoCreate,MapSeguimientoUpdateParcial } from '../mappers/seguimiento.mapper';
import { toHttpParams} from '@app/components/utils/http.utils';

@Injectable({ providedIn: 'root' })
export class SeguimientoService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL); // p.ej. http://localhost:3000
  private readonly base = `${this.apiUrl}/seguimiento`;

  // ====== BÁSICOS ======

  /** Lista paginada/filtrada (para /ciudadano) */
  list(opts: VMSeguimientoListaOptions,): Observable<VMPage<VMSeguimientoListaSimple>> {
    
    const dto:DTOSeguimientoListaOptions=MapSeguimientoListaOpciones(opts);
    const params = toHttpParams(dto);
    
    return this.http
    .get<ApiSeguimientoPageSimple>(this.base, { params })
    .pipe(map(apiPage=>MapPageToVM<ApiSeguimientoListaSimple,VMSeguimientoListaSimple>(apiPage,MapSeguimientoListaItemVM)))
    
  }
  

  async create(vm: VMSeguimientoCreate): Promise<number> {
    const dto: DTOSeguimientoCreate = MapSeguimientoCreate(vm);
    console.log("envia: ",dto);
    const response = await firstValueFrom(
      this.http.post<{ se_co_ID: number }>(this.base, dto)
    );

    return response.se_co_ID;
  }
  getById(id: number): Observable<VMSeguimientoDetalleSimple> {
  return this.http
    .get<ApiSeguimientoDetalleSimple>(`${this.base}/${id}`)
    .pipe(map(apiItem => MapSeguimientoDetalleListaSimple(apiItem)));// mapper que convierte Api → VM
  }

  async update(idconsulta: number,id: number, changes: Partial<VMSeguimientoUpdate>): Promise<number> {
    const dto: DTOSeguimientoUpdate = MapSeguimientoUpdateParcial(id,idconsulta, changes);
    const response = await firstValueFrom(
      this.http.patch<{ se_ID: number }>(`${this.base}/${idconsulta}/${id}`, dto)
    );
    return response.se_ID;
  }
}
