// events.routes.ts
import { Routes } from '@angular/router';

export const eventsRoutes: Routes = [
  { 
    path: 'create', 
    loadComponent: () => import('./pages/event-create/event-create.component')
      .then(m => m.EventCreateComponent)
  },

  // REMOVED any catch-all or empty path routes that might conflict
];