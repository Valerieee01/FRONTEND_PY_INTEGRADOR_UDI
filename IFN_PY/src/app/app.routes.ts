import { Routes } from '@angular/router';

import { InicioSesion } from './pages/inicio-sesion/inicio-sesion';
import { Usuarios } from './pages/usuarios/usuarios';
import { Conglomerados } from './pages/conglomerados/conglomerados';
import { Empleados } from './pages/empleados/empleados';
import { Equipos } from './pages/equipos/equipos';
import { Landing } from './pages/landing/landing';
import { MuestreoBotanico } from './pages/muestreo-botanico/muestreo-botanico';
import { MuestreoDetritosMadera } from './pages/muestreo-detritos-madera/muestreo-detritos-madera';
import { MuestreoSuelo } from './pages/muestreo-suelo/muestreo-suelo';
import { Personas } from './pages/personas/personas';
import { Subparcelas } from './pages/subparcelas/subparcelas';
import { PublicLayout } from './Layout/public-layout/public-layout';
import { AdminLayout } from './Layout/admin-layout/admin-layout';




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
      { path: 'Conglomerados', component: Conglomerados },
      { path: 'Usuarios', component: Usuarios },
      { path: 'Empleados', component: Empleados },
      { path: 'Equipos', component: Equipos },
      { path: 'MuestreoBotanico', component: MuestreoBotanico },
      { path: 'MuestreoDetritosMadera', component: MuestreoDetritosMadera },
      { path: 'MuestreoSuelo', component: MuestreoSuelo },
      { path: 'Personas', component: Personas },
      { path: 'Subparcelas', component: Subparcelas }
    ]
  }
];
