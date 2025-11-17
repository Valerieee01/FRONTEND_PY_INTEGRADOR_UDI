import { Routes } from '@angular/router';

import { InicioSesion } from './pages/inicio-sesion/inicio-sesion';
import { Usuarios } from './pages/usuarios/usuarios';
import { Conglomerados } from './pages/conglomerados/conglomerados';
import { Empleados } from './pages/empleados/empleados';
import { Equipos } from './pages/equipos/equipos';
import { Landing } from './pages/landing/landing';
import { MuestreoBotanico } from './pages/muestreo-botanico/muestreo-botanico';
import { MuestreoDetritosMadera } from './pages/muestreo-detritos-madera/muestreo-detritos-madera';
import { MuestreoSueloComponent } from './pages/muestreo-suelo/muestreo-suelo';
import { Personas } from './pages/personas/personas';
import { PublicLayout } from './Layout/public-layout/public-layout';
import { AdminLayout } from './Layout/admin-layout/admin-layout';
import { Dashboard } from './pages/dashboard/dashboard';




export const routes: Routes = [
  
    {
        path: '',
        component: PublicLayout,
        children: [
        {path: '', redirectTo: 'LandingPage', pathMatch: 'full' },
        { path: 'LandingPage', component: Landing },   
        { path: 'login', component: InicioSesion }
        
        ],
    },


  {
    path: '',
    component: AdminLayout,
    children: [
      { path: 'Inicio', component: Dashboard },
      { path: 'Conglomerados', component: Conglomerados },
      { path: 'Usuarios', component: Usuarios },
      { path: 'Empleados', component: Empleados },
      { path: 'Equipos', component: Equipos },
      { path: 'MuestreoBotanico', component: MuestreoBotanico },
      { path: 'MuestreoDetritosMadera', component: MuestreoDetritosMadera },
      { path: 'MuestreoSuelo', component: MuestreoSueloComponent },
      { path: 'Personas', component: Personas }
    ]
  }
];
