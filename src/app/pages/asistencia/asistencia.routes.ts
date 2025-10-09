import { Routes,UrlMatcher,UrlSegment } from '@angular/router';
import { accessGuardMatch } from '@app/guard/guard.access';
import { AsistenciaLista } from './asistencia.lista/asistencia.lista';

import { PaginaNoEncontradaComponent } from '../../components/paginanoencontrada/pagina';

export const numericIdMatcher: UrlMatcher = (segments: UrlSegment[]) =>
  segments.length === 1 && /^\d+$/.test(segments[0].path)
    ? { consumed: segments, posParams: { id: segments[0] } }
    : null;

export const asistenciaRoutes: Routes = [
  {
    path: 'asistencia',
    canMatch: [accessGuardMatch],
    children: [

      {path:'', component: AsistenciaLista,data:{minLevel:3},pathMatch: 'full'},
      {path:'**', component: PaginaNoEncontradaComponent },
    ],
    
  }
];