import { Routes,UrlMatcher,UrlSegment } from '@angular/router';
import { accessGuardMatch } from '@app/guard/guard.access';
import { JustificacionRegistrar } from './justificacion.registrar/justificacion.registrar';
import { JustificacionListaMis } from './justificacion.lista.mis/justificacion.lista.mis';
import { JustificacionListaPendientes } from './justificacion.lista.pendientes/justificacion.lista.pendientes';
import { PaginaNoEncontradaComponent } from '../../components/paginanoencontrada/pagina';

export const numericIdMatcher: UrlMatcher = (segments: UrlSegment[]) =>
  segments.length === 1 && /^\d+$/.test(segments[0].path)
    ? { consumed: segments, posParams: { id: segments[0] } }
    : null;

export const registrarNumericIdMatcher: UrlMatcher = (segments: UrlSegment[]) =>
  segments.length === 2 &&
  segments[0].path === 'registrar' &&
  /^\d+$/.test(segments[1].path)
    ? { consumed: segments, posParams: { id: segments[1] } }
    : null;

export const justificacionRoutes: Routes = [
  {
    path: 'justificacion',
    canMatch: [accessGuardMatch],
    children: [

      {path:'mis', component: JustificacionListaMis,data:{minLevel:3},pathMatch: 'full'},
      {path:'registrar', component: JustificacionRegistrar,data:{minLevel:3},pathMatch: 'full'},
      {path:'lista', component: JustificacionListaPendientes,data:{minLevel:2},pathMatch: 'full'},
      {path:'**', component: PaginaNoEncontradaComponent },
    ],
    
  }
];
