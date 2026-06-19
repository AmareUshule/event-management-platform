import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const communicationManagerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Allow Admin, Manager, or Communication Manager (using existing AuthService helper)
  if (authService.isAdmin() || authService.isManager() || authService.isCommunicationManager()) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
