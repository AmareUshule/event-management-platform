// app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './presentation/features/home/home.component';
import { LoginComponent } from './presentation/features/login/login.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
   
  // Events module - protected by auth
  { 
    path: 'events', 
    loadChildren: () => import('./presentation/features/events/events.routes')
      .then(m => m.eventsRoutes),
    canActivate: [authGuard],
  },
   // Specific event detail route - using lazy loading for the standalone component
  { 
    path: 'events/:id', 
    loadComponent: () => import('./presentation/features/events/pages/event-details/event-detail-page.component')
      .then(m => m.EventDetailPageComponent),
    canActivate: [authGuard]
  },
  
  // Regular user dashboard
  {
    path: 'dashboard',
    loadComponent: () => import('./presentation/features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent)
  },
  
  // Admin dashboard
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./presentation/features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] }
  },
  
  {
    path: 'register',
    loadComponent: () => import('./presentation/features/register/register.component')
      .then(m => m.RegistrationComponent)
  },

  { path: '**', redirectTo: '' }
];