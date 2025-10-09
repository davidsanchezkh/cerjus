import { Routes,UrlMatcher,UrlSegment } from '@angular/router';
import { accessGuardMatch } from '@app/guard/guard.access';
import { SeguimientoListaConsulta} from './seguimiento.lista.consulta/seguimiento.lista.consulta';
import { SeguimientoRegistar } from './seguimiento.registrar/seguimiento.registrar';
import { PaginaNoEncontradaComponent } from '../../components/paginanoencontrada/pagina';

export const registrarNumericIdMatcher: UrlMatcher = (segments: UrlSegment[]) =>
  segments.length === 2 &&
  segments[0].path === 'registrar' &&
  /^\d+$/.test(segments[1].path)
    ? { consumed: segments, posParams: { id: segments[1] } }
    : null;


export const seguimientoRoutes: Routes = [
  {
    path: 'seguimiento',
    canMatch: [accessGuardMatch],
    children: [
      
      {path:'registrar', component: SeguimientoListaConsulta,data:{minLevel:3},pathMatch: 'full',},
      {matcher:registrarNumericIdMatcher, component: SeguimientoRegistar,data:{minLevel:3},pathMatch: 'full',},
      {path:'**', component: PaginaNoEncontradaComponent },
    ],
    
  }
];
