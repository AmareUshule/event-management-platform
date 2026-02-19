import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // First check if user is authenticated
  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  // Get required roles from route data
  const requiredRoles = route.data['roles'] as string[] | undefined;
  
  // If no specific roles required, allow access
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  // Check if user has any of the required roles
  const hasRequiredRole = requiredRoles.some(role => authService.hasRole(role));

  if (hasRequiredRole) {
    return true;
  }

  // Optional: Check for department-specific access
  const requiredDepartment = route.data['department'] as string | undefined;
  if (requiredDepartment) {
    const user = authService.getCurrentUser();
    // Fix: Remove 'this.' and call the function directly
    if (user && checkDepartmentAccess(user, requiredDepartment)) {
      return true;
    }
  }

  // User doesn't have required role, redirect to dashboard
  router.navigate(['/dashboard']);
  return false;
};

// Helper function for department-based access (defined outside)
function checkDepartmentAccess(user: any, requiredDepartment: string): boolean {
  const departmentMap: Record<number, string> = {
    1: 'INFORMATION_TECHNOLOGY',
    2: 'HUMAN_RESOURCES',
    3: 'FINANCE',
    4: 'MARKETING',
    5: 'OPERATIONS',
    6: 'COMMUNICATION',
    7: 'GENERAL_STAFF'
  };

  const userDepartment = departmentMap[user.departmentId];
  return userDepartment === requiredDepartment;
}