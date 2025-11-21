// src/app/pages/usuario/services/usuario.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable,firstValueFrom} from 'rxjs';
import { API_URL } from '@app/app.token';

import {VMUsuarioListaSimple,VMUsuarioListaOptions,VMUsuarioDetalle,VMPage,VMUsuarioUpdateForm,} from '../models/usuario.vm';
import {ApiUsuarioListaSimple,ApiUsuarioPageSimple,ApiUsuarioDetalle,ApiTipoUsuario} from '../models/usuario.api';
import {MapUsuarioListaItemVM,MapPageToVM,MapUsuarioListaOpciones,MapUsuarioDetalleVM,MapUsuarioUpdateParcial,} from '../mappers/usuario.mapper';
import { DTOUsuarioListaOptions, DTOUsuarioUpdate } from '../models/usuario.dtos';
import { toHttpParams } from '@app/components/utils/http.utils';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);
  private readonly base = `${this.apiUrl}/usuario`;
   private readonly base2 = `${this.apiUrl}/tipousuario`;

  /** Lista paginada/filtrada */
  list(opts: VMUsuarioListaOptions): Observable<VMPage<VMUsuarioListaSimple>> {
    const dto: DTOUsuarioListaOptions = MapUsuarioListaOpciones(opts);
    const params = toHttpParams(dto);

    return this.http
      .get<ApiUsuarioPageSimple>(this.base, { params })
      .pipe(
        map(apiPage =>
          MapPageToVM<ApiUsuarioListaSimple, VMUsuarioListaSimple>(
            apiPage,
            MapUsuarioListaItemVM,
          ),
        ),
      );
  }

  /** Detalle por id */
  getById(id: number): Observable<VMUsuarioDetalle> {
    return this.http
      .get<ApiUsuarioDetalle>(`${this.base}/${id}`)
      .pipe(map(apiItem => MapUsuarioDetalleVM(apiItem)));
  }
  listAll(): Observable<ApiTipoUsuario[]> {
    return this.http.get<ApiTipoUsuario[]>(this.base2);
  }
  /** Update parcial (solo estado y rol) */
  async update(id: number, changes: VMUsuarioUpdateForm): Promise<void> {
    const dto: DTOUsuarioUpdate = MapUsuarioUpdateParcial(id, changes);
    await firstValueFrom(
      this.http.patch(`${this.base}/${id}`, dto),
    );
    
  }

}

