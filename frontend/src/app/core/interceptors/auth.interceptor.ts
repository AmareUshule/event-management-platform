import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Skip auth for login and public endpoints
  const excludedEndpoints = [
    '/auth/login',
    '/auth/refresh',
    '/public/',
    '/assets/'
  ];
  
  const shouldSkipAuth = excludedEndpoints.some(endpoint => 
    req.url.includes(endpoint)
  );
  
  if (shouldSkipAuth) {
    return next(req);
  }
  
  // Get token from auth service
  const token = authService.getToken();
  
  // Clone request and add authorization header if token exists
  const authReq = token 
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;
  
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle authentication errors
      if (error.status === 401) {
        // Token expired or invalid
        console.warn('Authentication failed, redirecting to login');
        //authService.clearAuthData(); // Use clearAuthData instead of logout to avoid redirect loop
        router.navigate(['/login'], { 
          queryParams: { 
            sessionExpired: true,
            returnUrl: router.url 
          } 
        });
      }
      
      // Handle authorization errors
      if (error.status === 403) {
        console.warn('Access forbidden');
        router.navigate(['/unauthorized']);
      }
      
      return throwError(() => error);
    })
  );
};
export default authInterceptor;