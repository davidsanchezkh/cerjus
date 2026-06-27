// src/app/pages/proceso/services/proceso.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, firstValueFrom } from 'rxjs';

import { API_URL } from '../../../app.token';
import { toHttpParams } from '@app/components/utils/http.utils';

import {ApiProcesoDetalleSimple,ApiProcesoListaSimple,ApiProcesoPageSimple,ApiProcesoControl,ApiProcesoAsesorActual } from '../models/proceso.api';

import {VMPage,VMProcesoCreate,VMProcesoDetalleSimple,VMProcesoListaOptions,VMProcesoListaSimple,VMProcesoUpdate,VMProcesoControl,
    VMProcesoAsesorActual,} from '../models/proceso.vm';

import {DTOProcesoCreate,DTOProcesoListaOptions,DTOProcesoUpdate} from '../models/proceso.dtos';

import {MapPageToVM,MapProcesoCreate,MapProcesoDetalleVM,MapProcesoListaItemVM,MapProcesoListaOpciones,MapProcesoUpdateParcial,
    MapProcesoControl,MapProcesoAsesorActual,} from '../mappers/proceso.mapper';

@Injectable({ providedIn: 'root' })
export class ProcesoService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);
  private readonly base = `${this.apiUrl}/proceso`;

  list(opts: VMProcesoListaOptions): Observable<VMPage<VMProcesoListaSimple>> {
    const dto: DTOProcesoListaOptions = MapProcesoListaOpciones(opts);
    const params = toHttpParams(dto);

    return this.http
      .get<ApiProcesoPageSimple>(this.base, { params })
      .pipe(
        map(apiPage =>
          MapPageToVM<ApiProcesoListaSimple, VMProcesoListaSimple>(
            apiPage,
            MapProcesoListaItemVM,
          ),
        ),
      );
  }

    async create(vm: VMProcesoCreate): Promise<number> {
        
        const dto: DTOProcesoCreate = MapProcesoCreate(vm);
        
        const response = await firstValueFrom(
        this.http.post<{ pr_ID: number }>(this.base, dto),
        );

        return response.pr_ID;
    }

    getById(id: number): Observable<VMProcesoDetalleSimple> {
        return this.http
        .get<ApiProcesoDetalleSimple>(`${this.base}/${id}`)
        .pipe(map(apiItem => MapProcesoDetalleVM(apiItem)));
    }

    async update(id: number, changes: Partial<VMProcesoUpdate>): Promise<number> {
            const dto: DTOProcesoUpdate = MapProcesoUpdateParcial(id, changes);

            const response = await firstValueFrom(
            this.http.patch<{ pr_ID: number }>(`${this.base}/${id}`, dto),
            );

            return response.pr_ID;
    }
    getControlById(id: number): Observable<VMProcesoControl> {
        return this.http
            .get<ApiProcesoControl>(`${this.base}/${id}/control`)
            .pipe(map(apiItem => MapProcesoControl(apiItem)));
    }

    async asignarme(id: number): Promise<VMProcesoAsesorActual> {
        const response = await firstValueFrom(
            this.http.patch<ApiProcesoAsesorActual>(`${this.base}/${id}/asignarme`, {}),
        );

        return MapProcesoAsesorActual(response);
    }
}