import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  // Public routes
  {
    path: 'login',
    loadComponent: () =>  import('../features/login/login.component')
      .then(m => m.LoginComponent),
    title: 'Login - Event Management System'
  },

  // Default and fallback routes
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];