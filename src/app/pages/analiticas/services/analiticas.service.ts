// src/app/analiticas/services/analiticas.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_URL } from '@app/app.token';
import { map, Observable } from 'rxjs';
import {
  VMPeriodQuery,
  VMLineaCiudadanos,
  VMBarrasApiladas,
  VMPastelMaterias,
  VMEtlRunResponse,
  VMEtlStatus,
  PeriodKind,
  PeriodView,
  VMDimMateria,     // 👈 nuevo
  VMDimCanal,       // 👈 nuevo
  VMDimUsuario      // 👈 nuevo
} from '../models/analiticas.vm';
import { ApiPastelMaterias, ApiSerieAtenciones, ApiSerieCiudadanos,ApiEtlStatus} from '../models/analiticas.api';
import { mapAtencionesBarras, mapLineaCiudadanos, mapPastelMaterias,mapEtlStatus } from '../mappers/analiticas.mapper';

function toHttpParams<T extends object>(obj: T): HttpParams {
  let p = new HttpParams();
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (v === undefined || v === null || v === '') continue;
    p = p.set(k, String(v));
  }
  return p;
}

@Injectable({ providedIn: 'root' })
export class AnaliticasService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);
  private base = `${this.apiUrl}/analytics`;

  // ---- Querys
  lineaCiudadanos(q: VMPeriodQuery): Observable<VMLineaCiudadanos> {
    return this.http
      .get<ApiSerieCiudadanos[]>(`${this.base}/linea-ciudadanos`, { params: toHttpParams(q) })
      .pipe(map(mapLineaCiudadanos));
  }

  barrasAtenciones(q: VMPeriodQuery): Observable<VMBarrasApiladas> {
    return this.http
      .get<ApiSerieAtenciones[]>(`${this.base}/barras-atenciones`, { params: toHttpParams(q) })
      .pipe(map(api => mapAtencionesBarras(api, q.view, q.kind)));
  }

  pastelMaterias(q: VMPeriodQuery): Observable<VMPastelMaterias> {
    return this.http
      .get<ApiPastelMaterias | { items: any[] }>(`${this.base}/pastel-materias`, { params: toHttpParams(q) })
      .pipe(map((res: any) => mapPastelMaterias(res.items ?? res)));
  }

  // ---- ETL: ejecutar
  runEtlRange(body: { start?: string; end?: string; year?: number; month?: number; only?: 'all' | 'facts' | 'summaries' }) {
    return this.http.post<VMEtlRunResponse>(`${this.base}/etl`, body);
  }
  runEtlPreset(preset: string, only: 'all' | 'facts' | 'summaries' = 'all') {
    // si usas /analytics/etl/run (como probaste)
    return this.http.post<VMEtlRunResponse>(`${this.base}/etl/run`, { preset, only });
  }

  // ---- ETL: status (última actualización + si hay job en curso)
  getEtlStatus() {
    return this.http
    .get<ApiEtlStatus>(`${this.base}/etl/status`)
    .pipe(map(mapEtlStatus)); 
    
  }
    getDimMaterias() {
        return this.http.get<VMDimMateria[]>(`${this.base}/dims/materias`);
    }

    getDimCanales() {
        return this.http.get<VMDimCanal[]>(`${this.base}/dims/canales`);
    }

    getDimUsuarios() {
        return this.http.get<VMDimUsuario[]>(`${this.base}/dims/usuarios`);
    }
}
