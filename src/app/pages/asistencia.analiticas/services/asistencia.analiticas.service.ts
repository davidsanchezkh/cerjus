// src/app/pages/asistencia.analiticas/services/asistencia.analiticas.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_URL } from '@app/app.token';
import { map, Observable } from 'rxjs';

import {
  VMAsistenciaDashboard,
  VMAsistenciaQuery,
  AsistenciaPeriodKind,
  AsistenciaPeriodRange,
} from '../models/asistencia.analiticas.vm';
import { ApiAsistenciaDashboardResponse } from '../models/asistencia.analiticas.api';
import { mapAsistenciaDashboard } from '../mappers/asistencia.analiticas.mapper';

function toHttpParams<T extends object>(obj: T): HttpParams {
  let p = new HttpParams();
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (v === undefined || v === null || v === '') continue;
    p = p.set(k, String(v));
  }
  return p;
}

@Injectable({ providedIn: 'root' })
export class AsistenciasDashboardService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);
  private base = `${this.apiUrl}/asistencia-analytics`;

  /** Calcula {desde, hasta} en YYYY-MM-DD según kind/range (tomando hoy como referencia). */
  private computeRange(
    kind: AsistenciaPeriodKind = 'week',
    range: AsistenciaPeriodRange = 'this',
  ): { desde: string; hasta: string } {
    const now = new Date();

    const toYmd = (d: Date): string => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const mondayOfWeek = (d0: Date): Date => {
      const d = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate());
      const day = d.getDay(); // 0=domingo..6=sábado
      const diff = day === 0 ? -6 : 1 - day;
      d.setDate(d.getDate() + diff);
      return d;
    };

    let start: Date;
    let end: Date;

    if (kind === 'week') {
      const base = mondayOfWeek(now);
      if (range === 'last') {
        base.setDate(base.getDate() - 7);
      }
      start = base;
      end = new Date(base);
      end.setDate(end.getDate() + 6);
    } else if (kind === 'year') {
      const year = now.getFullYear() + (range === 'last' ? -1 : 0);
      start = new Date(year, 0, 1);
      end = new Date(year, 11, 31);
    } else {
      // month (por defecto)
      const monthOffset = range === 'last' ? -1 : 0;
      const year = now.getFullYear();
      const month = now.getMonth() + monthOffset;
      start = new Date(year, month, 1);
      end = new Date(year, month + 1, 0);
    }

    return { desde: toYmd(start), hasta: toYmd(end) };
  }

  getDashboard(q: VMAsistenciaQuery): Observable<VMAsistenciaDashboard> {
    const kind = q.kind ?? 'week';
    const range = q.range ?? 'this';

    const { desde, hasta } = this.computeRange(kind, range);

    const params = toHttpParams({
      desde,
      hasta,
      // en el futuro: us_id: q.us_id,
    });

    return this.http
      .get<ApiAsistenciaDashboardResponse>(`${this.base}/dashboard-rango`, { params })
      .pipe(map(mapAsistenciaDashboard));
  }
}
