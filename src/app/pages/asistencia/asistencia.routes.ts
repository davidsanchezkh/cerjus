import { Routes } from '@angular/router';
import { accessGuardMatch } from '@app/guard/guard.access';

import { AsistenciaLista } from './asistencia.lista/asistencia.lista';
import { JustificacionListaMis } from '../justificacion/justificacion.lista.mis/justificacion.lista.mis';
import { JustificacionRegistrar } from '../justificacion/justificacion.registrar/justificacion.registrar';

import { PaginaNoEncontradaComponent } from '../../components/paginanoencontrada/pagina';

export const asistenciaRoutes: Routes = [
  {
    path: 'asistencia',
    canMatch: [accessGuardMatch],
    children: [
      {path: '',component: AsistenciaLista,data: { minLevel: 3 },pathMatch: 'full',},
      {path: 'justificacion/mis',component: JustificacionListaMis,data: { minLevel: 3 },pathMatch: 'full',},
      {path: 'justificacion/registrar',component: JustificacionRegistrar,data: { minLevel: 3 },pathMatch: 'full',},
      { path: '**', component: PaginaNoEncontradaComponent },
    ],
  },
];