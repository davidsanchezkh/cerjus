import { Routes } from '@angular/router';
import { accessGuardMatch } from '@app/guard/guard.access';
import { AsistenciasDashboard } from './asistencia.analiticas.dashboard/asistencia.analiticas.dashboard';
import { PaginaNoEncontradaComponent } from '../../components/paginanoencontrada/pagina';

export const asistenciaanaliticasRoutes: Routes = [
  {
    path: 'controlususario',
    canMatch: [accessGuardMatch],
    children: [
      { path:'', component: AsistenciasDashboard, data: { minLevel: 2 }, pathMatch: 'full' },
      {path:'**', component: PaginaNoEncontradaComponent },
    ],
  },
];
