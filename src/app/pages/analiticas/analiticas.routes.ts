import { Routes } from '@angular/router';
import { accessGuardMatch } from '@app/guard/guard.access';
import { AnaliticasDashboard } from './analiticas.dashboard/analiticas.dashboard';
import { PaginaNoEncontradaComponent } from '../../components/paginanoencontrada/pagina';

export const analiticasRoutes: Routes = [
  {
    path: 'analiticas',
    canMatch: [accessGuardMatch],
    children: [
      { path:'', component: AnaliticasDashboard, data: { minLevel: 2 }, pathMatch: 'full' },
      {path:'**', component: PaginaNoEncontradaComponent },
    ],
  },
];
