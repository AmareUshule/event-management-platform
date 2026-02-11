import { inject } from '@angular/core';
import { 
  Router, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  UrlTree 
} from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const authGuard = (
  route: ActivatedRouteSnapshot, 
  state: RouterStateSnapshot
): boolean | UrlTree => {
  
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login'], {
      queryParams: { 
        returnUrl: state.url,
        reason: 'not_authenticated'
      }
    });
  }
  
  // Check role requirements if specified
  const requiredRoles = route.data?.['roles'] as string[];
  if (requiredRoles && requiredRoles.length > 0) {
    if (!authService.hasAnyRole(requiredRoles)) {
      return router.createUrlTree(['/unauthorized'], {
        queryParams: { 
          returnUrl: state.url,
          missingRoles: requiredRoles.join(',')
        }
      });
    }
  }
  
  return true;
};