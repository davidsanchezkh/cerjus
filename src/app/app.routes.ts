
import { Routes } from '@angular/router';

import { Main_layout } from './layouts/main_layout/main_layout';
import { Simple_layout } from './layouts/simple_layout/simple_layout';

import { ciudadanoRoutes } from './pages/ciudadano/ciudadano.routes';
import { consultaRoutes } from './pages/consulta/consulta.routes';
import { seguimientoRoutes } from './pages/seguimiento/seguimiento.routes';
import { asistenciaRoutes } from './pages/asistencia/asistencia.routes';
import { loginRoutes } from './pages/login/login.routes';
import { analiticasRoutes } from './pages/analiticas/analiticas.routes';
import { PaginaNoEncontradaComponent } from './components/paginanoencontrada/pagina';


export const routes: Routes = [
    {path:'', component: Simple_layout,
        children:[
            {path:'', redirectTo:'login', pathMatch:'full', },
            ...loginRoutes,
        ]
    },
    {path:'', component: Main_layout,
        children:[
            ...asistenciaRoutes,
            ...ciudadanoRoutes,
            ...consultaRoutes,
            ...seguimientoRoutes,
            ...analiticasRoutes,
        ]
    },
    {path:'**', component: PaginaNoEncontradaComponent },
];
