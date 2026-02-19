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
      .then(m => m.DashboardComponent)
  },
  { path: '**', redirectTo: '' },
];
