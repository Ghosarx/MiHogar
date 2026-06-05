import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    title: 'MiHogar — Encuentra tu hogar'
  },
  {
    path: 'comprar',
    loadComponent: () => import('./pages/catalogo/catalogo.component').then(m => m.CatalogoComponent),
    data: { tipo: 'venta' },
    title: 'Comprar propiedades — MiHogar'
  },
  {
    path: 'alquilar',
    loadComponent: () => import('./pages/catalogo/catalogo.component').then(m => m.CatalogoComponent),
    data: { tipo: 'alquiler' },
    title: 'Alquilar propiedades — MiHogar'
  },
  {
    path: 'publicar',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/publicar/publicar.component').then(m => m.PublicarComponent),
    title: 'Publicar propiedad — MiHogar'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/registro/registro.component').then(m => m.RegistroComponent),
    data: { initialMode: 'login' },
    title: 'Iniciar sesión — MiHogar'
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/registro/registro.component').then(m => m.RegistroComponent),
    data: { initialMode: 'register' },
    title: 'Registro — MiHogar'
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent),
    title: 'Panel Admin — MiHogar'
  },
  { path: '**', redirectTo: '' }
];
