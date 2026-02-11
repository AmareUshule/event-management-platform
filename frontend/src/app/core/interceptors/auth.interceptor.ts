import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Skip authentication for these endpoints
  const excludedUrls = [
    '/auth/login',
    '/auth/refresh',
    '/auth/register',
    '/auth/forgot-password',
    '/public/',
    '/assets/'
  ];
  
  const shouldSkip = excludedUrls.some(url => req.url.includes(url));
  
  if (shouldSkip) {
    return next(req);
  }
  
  // Add authorization header if token exists
  const token = authService.getToken();
  const authReq = token 
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;
  
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Unauthorized - token expired or invalid
        authService.logout();
        router.navigate(['/login'], {
          queryParams: { 
            sessionExpired: true,
            returnUrl: router.url 
          }
        });
      }
      
      if (error.status === 403) {
        // Forbidden - insufficient permissions
        router.navigate(['/unauthorized']);
      }
      
      return throwError(() => error);
    })
  );
};