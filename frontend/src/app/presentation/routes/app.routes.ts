import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
<<<<<<< HEAD
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
=======
  // { path: 'login', loadComponent: () => import('../pages/login.component').then(m => m.WebappLoginComponent) },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
>>>>>>> f84a1d540d0e6d261c1eeb1f979fde6af1ae5672
