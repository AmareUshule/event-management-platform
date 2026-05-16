// events.routes.ts
import { Routes } from '@angular/router';

export const eventsRoutes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./pages/event-discovery/event-discovery.component')
      .then(m => m.EventDiscoveryComponent)
  },
  { 
    path: 'create', 
    loadComponent: () => import('./pages/event-create/event-create.component')
      .then(m => m.EventCreateComponent)
  },
  { 
    path: 'edit/:id', 
    loadComponent: () => import('./pages/event-create/event-create.component')
      .then(m => m.EventCreateComponent)
  },
  { 
    path: ':id', 
    loadComponent: () => import('./pages/event-details/event-detail-page.component')
      .then(m => m.EventDetailPageComponent)
  },
];
