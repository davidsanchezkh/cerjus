import { Routes } from '@angular/router';
import { accessGuardMatch } from '@app/guard/guard.access';

import { JustificacionListaPendientes } from './justificacion.lista.pendientes/justificacion.lista.pendientes';
import { PaginaNoEncontradaComponent } from '../../components/paginanoencontrada/pagina';

export const justificacionRoutes: Routes = [
  {
    path: 'justificacion',
    canMatch: [accessGuardMatch],
    children: [
      {path: 'lista',component: JustificacionListaPendientes,data: { minLevel: 2 },pathMatch: 'full',},
      { path: '**', component: PaginaNoEncontradaComponent },
    ],
  },
];