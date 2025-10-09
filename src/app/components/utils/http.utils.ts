import { HttpParams } from '@angular/common/http';

function isDate(val: unknown): val is Date {
  return val instanceof Date;
}
export function toHttpParams(obj: Record<string, any>): HttpParams {
  let params = new HttpParams();

  Object.entries(obj).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    if (typeof value === 'string' && value.trim() === '') return;

    if (Array.isArray(value)) {
      value.forEach(v => {
        if (v != null && String(v).trim() !== '') {
          params = params.append(key, String(v));
        }
      });
      return;
    }

    if (isDate(value)) {
      params = params.set(key, value.toISOString());
      return;
    }

    params = params.set(key, String(value));
  });

  return params;
}