import { Routes } from '@angular/router';
import { authGuard } from '../../../core/guards/auth.guard';

export const announcementsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/announcements-page/announcements-page.component')
      .then(m => m.AnnouncementsPageComponent),
    canActivate: [authGuard]
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/announcement-detail-page/announcement-detail-page.component')
      .then(m => m.AnnouncementDetailPageComponent),
    canActivate: [authGuard]
  }
];
