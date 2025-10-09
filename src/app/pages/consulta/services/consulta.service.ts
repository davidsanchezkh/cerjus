import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map,Observable } from 'rxjs';
import { API_URL } from '../../../app.token'; // su token ya existente
import {firstValueFrom} from 'rxjs';

import { DTOConsultaCreate,DTOConsultaListaOptions, DTOConsultaUpdate } from '../models/consulta.dtos';
import { ApiConsultaListaSimple, ApiConsultaPageSimple,ApiConsultaDetalleSimple } from '../models/consulta.api';
import { VMPage, VMConsultaListaSimple,VMConsultaListaOptions,VMConsultaCreate,VMConsultaDetalleSimple, VMConsultaUpdate } from '../models/consulta.vm';
import { MapConsultaDetalleListaSimple,MapConsultaListaItemVM, MapPageToVM,MapConsultaListaOpciones,MapConsultaCreate,MapConsultaUpdateParcial } from '../mappers/consulta.mapper';
import { toHttpParams} from '@app/components/utils/http.utils';

@Injectable({ providedIn: 'root' })
export class ConsultaService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL); // p.ej. http://localhost:3000
  private readonly base = `${this.apiUrl}/consulta`;

  // ====== BÁSICOS ======

  /** Lista paginada/filtrada (para /ciudadano) */
  list(opts: VMConsultaListaOptions,): Observable<VMPage<VMConsultaListaSimple>> {
    
    const dto:DTOConsultaListaOptions=MapConsultaListaOpciones(opts);
    const params = toHttpParams(dto);
    return this.http
    .get<ApiConsultaPageSimple>(this.base,{params})
    .pipe(map(apiPage=>MapPageToVM<ApiConsultaListaSimple,VMConsultaListaSimple>(apiPage,MapConsultaListaItemVM)));
  }
  

  async create(vm: VMConsultaCreate): Promise<number> {
    const dto: DTOConsultaCreate = MapConsultaCreate(vm);
    const response = await firstValueFrom(
      this.http.post<{ co_ID: number }>(this.base, dto)
    );

    return response.co_ID;
  }
  getById(id: number): Observable<VMConsultaDetalleSimple> {
  return this.http
    .get<ApiConsultaDetalleSimple>(`${this.base}/${id}`)
    .pipe(map(apiItem => MapConsultaDetalleListaSimple(apiItem)));// mapper que convierte Api → VM
  }
  async update(id: number, changes: Partial<VMConsultaUpdate>): Promise<number> {
    const dto: DTOConsultaUpdate = MapConsultaUpdateParcial(id, changes);
    const response = await firstValueFrom(
      this.http.patch<{ ci_ID: number }>(`${this.base}/${id}`, dto)
    );
    return response.ci_ID;
  }
}
