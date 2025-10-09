
import { Routes } from '@angular/router';

import { Main_layout } from './layouts/main_layout/main_layout';
import { Auth_layout } from './layouts/auth_layout/auth_layout';

import { Login } from './pages/login/login';

import { loginGuardMactch } from './guard/guard.login';
import { accessGuardMatch } from './guard/guard.access';

import { ciudadanoRoutes } from './pages/ciudadano/ciudadano.routes';
import { consultaRoutes } from './pages/consulta/consulta.routes';
import { seguimientoRoutes } from './pages/seguimiento/seguimiento.routes';
import { asistenciaRoutes } from './pages/asistencia/asistencia.routes';
import { PaginaNoEncontradaComponent } from './components/paginanoencontrada/pagina';


export const routes: Routes = [
    {path:'', component: Auth_layout,
        children:[
            {path:'', redirectTo:'login', pathMatch:'full', },
            {path:'login',component:Login,canMatch:[loginGuardMactch],pathMatch: 'full',}
        ]
    },
    {path:'', component: Main_layout,
        children:[
            ...asistenciaRoutes,
            ...ciudadanoRoutes,
            ...consultaRoutes,
            ...seguimientoRoutes,
        ]
    },
    {path:'**', component: PaginaNoEncontradaComponent },
];
