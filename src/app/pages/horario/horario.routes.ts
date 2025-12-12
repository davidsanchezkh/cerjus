// src/app/features/horario/horario.routes.ts
import { Routes, UrlMatcher, UrlSegment } from '@angular/router';
import { accessGuardMatch } from '@/app/guard/guard.access';
import { HorarioLista } from './horario.lista/horario.lista';
import { HorarioRegistrar } from './horario.registrar/horario.registrar';
import {  HorarioDetalle } from './horario.detalle/horario.detalle';
// (cuando implemente detalle):
// import { HorarioDetalle } from './horario.detalle/horario.detalle';
import { PaginaNoEncontradaComponent } from '@/app/components/paginanoencontrada/pagina';

export const numericIdMatcherHorario: UrlMatcher = (segments: UrlSegment[]) =>
  segments.length === 1 && /^\d+$/.test(segments[0].path)
    ? { consumed: segments, posParams: { id: segments[0] } }
    : null;

export const horarioRoutes: Routes = [
  {
    path: 'horario',
    canMatch: [accessGuardMatch],
    children: [
        { path: '', component: HorarioLista, data: { minLevel: 1 }, pathMatch: 'full' },
        { path: 'registrar', component: HorarioRegistrar, data: { minLevel: 1 }, pathMatch: 'full' },
        { matcher: numericIdMatcherHorario, component: HorarioDetalle, data: { minLevel: 1 } },
        { path: '**', component: PaginaNoEncontradaComponent },
    ],
  },
];
