 

import { Routes } from '@angular/router';

export const eventsRoutes: Routes = [
  { 
    path: 'create', 
    loadComponent: () => import('./pages/event-create/event-create.component')
      .then(m => m.EventCreateComponent)
  }
];