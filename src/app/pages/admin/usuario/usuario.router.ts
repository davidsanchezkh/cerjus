import { Routes,UrlMatcher,UrlSegment } from '@angular/router';
import { accessGuardMatch } from '@app/guard/guard.access';
import { UsuarioLista } from './usuario.lista/usuario.lista';
import { UsuarioDetalle } from './usuario.detalle/usuario.detalle';
import { PaginaNoEncontradaComponent } from '@/app/components/paginanoencontrada/pagina';

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

export const usuarioRoutes: Routes = [
  {
    path: 'usuario',
    canMatch: [accessGuardMatch],
    children: [
      { path: 'lista', component: UsuarioLista, data: { minLevel: 1 }, pathMatch: 'full' },
      {matcher:numericIdMatcher, component: UsuarioDetalle,data:{minLevel:2}},
      {path:'**', component: PaginaNoEncontradaComponent },
    ],
  },
];

