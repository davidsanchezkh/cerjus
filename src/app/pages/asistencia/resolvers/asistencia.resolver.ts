import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { AsistenciaService } from '../services/asistencia.service';

export const asistenciaResolver: ResolveFn<any> = (route) => {
  const service = inject(AsistenciaService);
  const page = Number(route.queryParamMap.get('page') ?? 1);
  const pageSize = Number(route.queryParamMap.get('pageSize') ?? 9); // su nuevo tamaño
  // sin filtros en el primer load; si usa query params, léalos y páselos aquí
  return service.list({ page, pageSize });
}