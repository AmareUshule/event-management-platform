import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const adminOrCommManagerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Allow only Admin or Communication Manager
  if (authService.isAdmin() || authService.isCommunicationManager()) {
    return true;
  }

  // For any other role, redirect to their default dashboard
  router.navigate(['/dashboard']);
  return false;
};
