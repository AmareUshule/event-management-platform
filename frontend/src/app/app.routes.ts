// app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './presentation/features/home/home.component';
import { LoginComponent } from './presentation/features/login/login.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { communicationManagerGuard } from './core/guards/communication-manager.guard';
import { MainLayoutComponent } from './presentation/layouts/main-layout.component';

export const appRoutes: Routes = [
  // Public Routes
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
   
  // Protected Routes with Main Layout
  {
    path: 'dashboard',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { 
        path: '', 
        loadComponent: () => import('./presentation/features/dashboard/dashboard.component')
          .then(m => m.DashboardComponent)
      }
    ]
  },

  {
    path: 'gallery',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./presentation/features/gallery/gallery.component')
          .then(m => m.GalleryComponent)
      }
    ]
  },

  {
    path: 'home',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { 
        path: '', 
        component: HomeComponent
      }
    ]
  },

  {
    path: 'events',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { 
        path: '', 
        loadChildren: () => import('./presentation/features/events/events.routes')
          .then(m => m.eventsRoutes)
      }
    ]
  },

  {
    path: 'internal-announcements',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { 
        path: '', 
        loadChildren: () => import('./presentation/features/internal-announcements/internal-announcements.routes')
          .then(m => m.announcementsRoutes)
      }
    ]
  },

  {
    path: 'staff-workload',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./presentation/features/reports/pages/staff-workload/staff-workload.component')
          .then(m => m.StaffWorkloadComponent),
        // Allow Admin, Manager, or Communication Manager
        canActivate: [communicationManagerGuard]
      },
      {
        path: ':staffId',
        loadComponent: () => import('./presentation/features/reports/pages/workload-detail/workload-detail-page.component')
          .then(m => m.WorkloadDetailPageComponent),
        canActivate: [communicationManagerGuard]
      }
    ]
  },

  {
    path: 'admin/dashboard',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./presentation/features/dashboard/dashboard.component')
          .then(m => m.DashboardComponent),
        canActivate: [roleGuard],
        data: { roles: ['Admin'] }
      }
    ]
  },

  {
    path: 'register',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./presentation/features/register/register.component')
          .then(m => m.RegistrationComponent)
      }
    ]
  },

  {
    path: 'profile',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./presentation/features/profile/pages/profile-page/profile-page.component')
          .then(m => m.ProfilePageComponent)
      }
    ]
  },

  {
    path: 'calendar',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./presentation/features/calendar/pages/calendar-page/calendar-page.component')
          .then(m => m.CalendarPageComponent)
      }
    ]
  },

  { path: '**', redirectTo: '' }
];
