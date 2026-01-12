import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  // { path: 'login', loadComponent: () => import('../pages/login.component').then(m => m.WebappLoginComponent) },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
