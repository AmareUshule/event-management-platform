<<<<<<< HEAD
 

import { Routes } from '@angular/router';
import { HomeComponent } from './presentation/features/home/home.component';
import { LoginComponent } from './presentation/features/login/login.component';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { 
    path: 'events', 
    loadChildren: () => import('./presentation/features/events/events.routes')
      .then(m => m.eventsRoutes)
  },

  {
    path: 'dashboard',
    loadComponent: () => import('./presentation/features/profile/dashboard.component')
      .then(m => m.DashboardComponent  )
  },



  { path: '**', redirectTo: '' },
];
=======
import { Route } from '@angular/router';
import { HomeComponent } from './home.component';
import { LoginComponent } from './login.component';

export const appRoutes: Route[] = [
	{ path: '', component: HomeComponent },
	{ path: 'login', component: LoginComponent },
	{ path: '**', redirectTo: '' },
];
>>>>>>> f84a1d540d0e6d261c1eeb1f979fde6af1ae5672
