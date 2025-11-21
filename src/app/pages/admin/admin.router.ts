import { Routes } from '@angular/router';
import { accessGuardMatch } from '@app/guard/guard.access';
import { usuarioRoutes } from './usuario/usuario.router'

export const adminRoutes: Routes = [
  {
    path: 'admin',
    canMatch: [accessGuardMatch],
    children: [
        ...usuarioRoutes,
    ],
  },
];
