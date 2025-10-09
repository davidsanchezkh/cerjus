import { Routes,UrlMatcher,UrlSegment } from '@angular/router';
import { accessGuardMatch } from '@app/guard/guard.access';
import { CiudadanoLista } from './ciudadano.lista/ciudadano.lista';
import { CiudadanoRegistar } from './ciudadano.registrar/ciudadano.registrar';
import { CiudadanoDetalle} from './ciudadano.detalle/ciudadano.detalle';
import { PaginaNoEncontradaComponent } from '../../components/paginanoencontrada/pagina';


export const numericIdMatcher: UrlMatcher = (segments: UrlSegment[]) =>
  segments.length === 1 && /^\d+$/.test(segments[0].path)
    ? { consumed: segments, posParams: { id: segments[0] } }
    : null;

export const ciudadanoRoutes: Routes = [
  {
    path: 'ciudadano',
    canMatch: [accessGuardMatch],
    children: [

      {path:'', component: CiudadanoLista,data:{minLevel:3},pathMatch: 'full'},
      {path:'registrar', component: CiudadanoRegistar,data:{minLevel:3},pathMatch: 'full'},
      {matcher:numericIdMatcher, component: CiudadanoDetalle,data:{minLevel:3},},
      {path:'**', component: PaginaNoEncontradaComponent },
    ],
    
  }
];