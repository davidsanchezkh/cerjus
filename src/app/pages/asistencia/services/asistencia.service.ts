import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map,Observable } from 'rxjs';
import { API_URL } from '../../../app.token'; // su token ya existente
import {firstValueFrom} from 'rxjs';

import { DTOAsistenciaListaOptions } from '../models/asistencia.dto';
import { ApiAsistenciaListaSimple, ApiAsistenciaPageSimple,ApiAsistenciaDetalleSimple } from '../models/asistencia.api';
import { VMPage, VMAsistenciaListaSimple,VMAsistenciaListaOptions,VMAsistenciaDetalleSimple} from '../models/asistencia.vm';
import { MapAsistenciaListaItemVM, MapPageToVM,MapAsistenciaListaOpciones} from '../mappers/asistencia.mapper';
import {toHttpParams} from '@app/components/utils/http.utils';

@Injectable({ providedIn: 'root' })
export class AsistenciaService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL); // p.ej. http://localhost:3000
  private readonly base = `${this.apiUrl}/asistencia`;

  // ====== BÁSICOS ======

  /** Lista */
  list(opts: VMAsistenciaListaOptions,): Observable<VMPage<VMAsistenciaListaSimple>> {
    
    const dto:DTOAsistenciaListaOptions=MapAsistenciaListaOpciones(opts);
    const params = toHttpParams(dto);
    
    return this.http
    .get<ApiAsistenciaPageSimple>(this.base, { params })
    .pipe(map(apiPage=>MapPageToVM<ApiAsistenciaListaSimple,VMAsistenciaListaSimple>(apiPage,MapAsistenciaListaItemVM)))
    
  }
}