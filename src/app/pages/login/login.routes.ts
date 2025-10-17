import { Routes,UrlMatcher,UrlSegment } from '@angular/router';
import { loginGuardMactch } from '@app/guard/guard.login';
import { Ingresar } from './login.ingresar/ingresar';
import { Registar } from './login.registrar/registar';
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

export const loginRoutes: Routes = [
  {
    path: 'login',
    canMatch: [loginGuardMactch],
    children: [
      
      {path:'', component: Ingresar,pathMatch: 'full'},
      {path:'registrar', component: Registar,pathMatch: 'full'},
      //{matcher:registrarNumericIdMatcher, component: ConsultaRegistar,data:{minLevel:3}},
      //{matcher:numericIdMatcher, component: ConsultaDetalle,data:{minLevel:3}},
      {path:'**', component: PaginaNoEncontradaComponent },
    ],
    
  }
];
