import { Routes } from '@angular/router';
import { accessGuardMatch } from '@app/guard/guard.access';
import { AnaliticasDashboard } from './analiticas.dashboard/analiticas.dashboard';

export const analiticasRoutes: Routes = [
  {
    path: 'analiticas',
    canMatch: [accessGuardMatch],
    children: [
      { path: '', component: AnaliticasDashboard, data: { minLevel: 3 }, pathMatch: 'full' },
    ],
  },
];
