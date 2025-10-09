import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { CiudadanoService } from '../services/ciudadano.service';

export const ciudadanoResolver: ResolveFn<any> = (route) => {
  const service = inject(CiudadanoService);
  const page = Number(route.queryParamMap.get('page') ?? 1);
  const pageSize = Number(route.queryParamMap.get('pageSize') ?? 9); // su nuevo tamaño
  // sin filtros en el primer load; si usa query params, léalos y páselos aquí
  return service.list({ page, pageSize });
}