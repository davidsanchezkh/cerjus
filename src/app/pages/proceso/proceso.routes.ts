// src/app/pages/proceso/proceso.routes.ts

import { Routes } from '@angular/router';
import { accessGuardMatch } from '@app/guard/guard.access';
import { ProcesoLista } from './proceso.lista/proceso.lista';
import { ProcesoRegistrar } from './proceso.registrar/proceso.registrar';
import { ProcesoDetalle } from './proceso.detalle/proceso.detalle';
import { PaginaNoEncontradaComponent } from '../../components/paginanoencontrada/pagina';

export const procesoRoutes: Routes = [
  {
    path: 'proceso',
    canMatch: [accessGuardMatch],
    children: [
      {path: '',component: ProcesoLista,data: { minLevel: 3 },pathMatch: 'full',},
      {path: 'registrar',component: ProcesoRegistrar,data: { minLevel: 3 },pathMatch: 'full',},
      {path: ':idproceso',component: ProcesoDetalle,data: { minLevel: 3 },},
      { path: '**', component: PaginaNoEncontradaComponent },
    ],
  },
];