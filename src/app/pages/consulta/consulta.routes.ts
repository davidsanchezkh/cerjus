import { Routes,UrlMatcher,UrlSegment } from '@angular/router';
import { accessGuardMatch } from '@app/guard/guard.access';
import { ConsultaListaCiudadano } from './consulta.lista.ciudadano/consulta.lista.ciudadano';
import { ConsultaRegistar } from './consulta.registrar/consulta.registrar';
import { ConsultaDetalle } from './consulta.detalle/consulta.detalle';
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

export const consultaRoutes: Routes = [
  {
    path: 'consulta',
    canMatch: [accessGuardMatch],
    children: [
      
      {path:'registrar', component: ConsultaRegistar,data:{minLevel:3}},
      {matcher:registrarNumericIdMatcher, component: ConsultaRegistar,data:{minLevel:3}},
      {matcher:numericIdMatcher, component: ConsultaDetalle,data:{minLevel:3}},
      {path:'**', component: PaginaNoEncontradaComponent },
    ],
    
  }
];
