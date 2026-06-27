import { Routes, UrlMatcher, UrlSegment } from '@angular/router';
import { accessGuardMatch } from '@app/guard/guard.access';
import { CiudadanoLista } from './ciudadano.lista/ciudadano.lista';
import { CiudadanoRegistrar } from './ciudadano.registrar/ciudadano.registrar';
import { CiudadanoDetalle } from './ciudadano.detalle/ciudadano.detalle';
import { ConsultaRegistar } from '../consulta/consulta.registrar/consulta.registrar';
import { ConsultaDetalle } from '../consulta/consulta.detalle/consulta.detalle';
import { PaginaNoEncontradaComponent } from '../../components/paginanoencontrada/pagina';
import { SeguimientoRegistar } from '../seguimiento/seguimiento.registrar/seguimiento.registrar';

export const numericIdMatcher: UrlMatcher = (segments: UrlSegment[]) =>
  segments.length === 1 && /^\d+$/.test(segments[0].path)
    ? { consumed: segments, posParams: { id: segments[0] } }
    : null;

export const ciudadanoRoutes: Routes = [
  {
    path: 'ciudadano',
    canMatch: [accessGuardMatch],
    children: [
      { path: '', component: CiudadanoLista, data: { minLevel: 3 }, pathMatch: 'full' },
      { path: 'registrar', component: CiudadanoRegistrar, data: { minLevel: 3 }, pathMatch: 'full' },

      { path: ':idciudadano/consulta/registrar', component: ConsultaRegistar, data: { minLevel: 3 } },
      { path: ':idciudadano/consulta/:idconsulta', component: ConsultaDetalle, data: { minLevel: 3 } },
      { path: ':idciudadano/consulta/:idconsulta/seguimiento/registrar', component: SeguimientoRegistar, data: { minLevel: 3 } },
      
      { matcher: numericIdMatcher, component: CiudadanoDetalle, data: { minLevel: 3 } },
      { path: '**', component: PaginaNoEncontradaComponent },
    ],
  }
];