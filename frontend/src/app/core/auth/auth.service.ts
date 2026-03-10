import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

import { AuthUser, LoginCredentials } from '../models/auth-user.model';
import { StorageService } from '../services/storage.service';
import { environment } from '../../../environments/environment';

import { DEPARTMENTS } from '../constants/departments.constants';
import { ROLES } from '../constants/roles.constants';
import { PERMISSIONS } from '../constants/permissions.constants';

// Interface matching your actual backend response
export interface BackendAuthResponse {
  token: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  employeeId: string;
  departmentId: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private storage = inject(StorageService);
  private platformId = inject(PLATFORM_ID);

  private readonly API_URL = `${environment.apiUrl}/api/Auth`;
  private readonly TOKEN_KEY = 'eep_auth_token';
  private readonly USER_KEY = 'eep_auth_user';
  private readonly TOKEN_EXPIRY_KEY = 'eep_token_expiry';

  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  // Department GUID to ID mapping (update with actual GUIDs from your database)
  private readonly departmentGuidToIdMap: Record<string, number> = {
    '4cfbbaf2-e974-46de-b5bd-1187669f1204': DEPARTMENTS.INFORMATION_TECHNOLOGY,
    // Add other department GUID mappings here based on your database
  };

  // Department ID to name mapping
  private readonly departmentIdToNameMap: Record<number, string> = {
    [DEPARTMENTS.INFORMATION_TECHNOLOGY]: 'Information Technology',
    [DEPARTMENTS.COMMUNICATION]: 'Communication',
    [DEPARTMENTS.HUMAN_RESOURCES]: 'Human Resources',
    [DEPARTMENTS.FINANCE]: 'Finance',
    [DEPARTMENTS.MARKETING]: 'Marketing',
    [DEPARTMENTS.OPERATIONS]: 'Operations',
    [DEPARTMENTS.GENERAL_STAFF]: 'General Staff'
  };

  constructor() {
    this.loadUserFromStorage();
  }

  // ====== PUBLIC API ======

  login(credentials: LoginCredentials): Observable<AuthUser> {
    this.setLoading(true);

    return this.http.post<BackendAuthResponse>(`${this.API_URL}/login`, {
      employeeId: credentials.employeeId,
      password: credentials.password
    }).pipe(
      tap(response => {
        console.log('Login response:', response);
        this.handleAuthSuccess(response);
        this.setLoading(false);
      }),
      map(response => this.mapBackendResponseToAuthUser(response)),
      catchError(error => {
        this.setLoading(false);
        return throwError(() => this.handleError(error));
      })
    );
  }

  logout(): void {
    const token = this.getToken();

    if (token && this.isBrowser()) {
      this.http.post(`${this.API_URL}/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        error: () => { } // Silent fail for logout
      });
    }

    this.clearAuthData();
    this.router.navigate(['/login'], {
      queryParams: { loggedOut: true }
    });
  }

  isAuthenticated(): boolean {
    // If not in browser, return true to avoid server-side redirect to login.
    // The client will perform the real check after hydration.
    if (!this.isBrowser()) {
      return true;
    }

    const user = this.currentUserSubject.value;
    const token = this.getToken();

    if (!user || !token) {
      return false;
    }

    if (this.isTokenExpired()) {
      this.clearAuthData();
      return false;
    }

    return true;
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  getCurrentUserId(): number {
    const user = this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    return user.employeeId;
  }

  getToken(): string | null {
    if (!this.isBrowser()) {
      return null;
    }
    return this.storage.getItem(this.TOKEN_KEY);
  }

  // =============== ROLE METHODS ===============

  hasRole(role: string): boolean {
    if (!this.isBrowser()) {
      return true;
    }
    const user = this.getCurrentUser();
    return user?.roles.includes(role) ?? false;
  }

  hasAnyRole(roles: string[]): boolean {
    if (!this.isBrowser()) {
      return true;
    }
    const user = this.getCurrentUser();
    return user ? roles.some(role => user.roles.includes(role)) : false;
  }

  isAdmin(): boolean {
    return this.hasRole(ROLES.Admin);
  }

  isManager(): boolean {
    return this.hasRole(ROLES.Manager);
  }

  isCommunicationManager(): boolean {
    const user = this.getCurrentUser();
    return this.isManager() && user?.departmentId === DEPARTMENTS.COMMUNICATION;
  }

  isDepartmentManager(): boolean {
    const user = this.getCurrentUser();
    return this.isManager() && user?.departmentId !== DEPARTMENTS.COMMUNICATION;
  }

  isStaff(): boolean {
    return this.hasRole(ROLES.Staff);
  }

  isEmployee(): boolean {
    return this.hasRole(ROLES.Employee);
  }

  getDashboardRoute(): string {
    if (this.isAdmin()) {
      return '/admin/dashboard';
    }

    if (this.isManager()) {
      return '/manager/dashboard';
    }

    if (this.isEmployee()) {
      return '/employee/dashboard';
    }

    return '/';
  }

  getDepartmentGuid(): string | null {
    const user = this.getCurrentUser();
    if (!user) return null;

    const reverseMap: Record<number, string> = {
      [DEPARTMENTS.INFORMATION_TECHNOLOGY]: '4cfbbaf2-e974-46de-b5bd-1187669f1204',
      // Add other mappings
    };

    return reverseMap[user.departmentId] || null;
  }

  // =============== PERMISSION METHODS ===============

  canCreateEvents(): boolean {
    // Only Admin and Managers (including Communication + Department managers)
    return this.isAdmin() || this.isManager();
  }

  canUploadVacancy(): boolean {
    // Same rule as event creation
    return this.isAdmin() || this.isManager();
  }

  canApproveEvents(): boolean {
    // Only Admin + Communication Manager can approve
    return this.isAdmin() || this.isCommunicationManager();
  }

  canViewAllEvents(): boolean {
    if (this.isAdmin()) return true;
    if (this.isCommunicationManager()) return true;
    return false;
  }

  canViewDepartmentEvents(): boolean {
    if (this.canViewAllEvents()) return true;
    if (this.isDepartmentManager()) return true;
    if (this.isStaff()) return this.isInCommunicationDepartment();
    if (this.isEmployee()) return true;
    return false;
  }

  canManageUsers(): boolean {
    return this.isAdmin();
  }

  isInCommunicationDepartment(): boolean {
    const user = this.getCurrentUser();
    return user?.departmentId === DEPARTMENTS.COMMUNICATION;
  }

  isInDepartment(departmentId: number): boolean {
    const user = this.getCurrentUser();
    return user?.departmentId === departmentId;
  }

  getUserPermissions(): string[] {
    const permissions: string[] = [];
    const user = this.getCurrentUser();

    if (!user) return permissions;

    if (this.isAdmin()) {
      permissions.push(
        PERMISSIONS.CREATE_EVENT,
        PERMISSIONS.APPROVE_EVENT,
        PERMISSIONS.DELETE_EVENT,
        PERMISSIONS.MANAGE_USERS,
        PERMISSIONS.VIEW_ALL_EVENTS,
        PERMISSIONS.VIEW_ALL_REPORTS
      );
    }

    if (this.isCommunicationManager()) {
      permissions.push(
        PERMISSIONS.CREATE_DEPARTMENT_EVENT,
        PERMISSIONS.APPROVE_DEPARTMENT_EVENT,
        PERMISSIONS.VIEW_DEPARTMENT_EVENTS,
        PERMISSIONS.VIEW_DEPARTMENT_REPORTS,
        PERMISSIONS.MANAGE_COMMUNICATION_EVENTS,
        PERMISSIONS.ASSIGN_CAMERA_MAN
      );
    }

    if (this.isDepartmentManager()) {
      permissions.push(
        PERMISSIONS.CREATE_DEPARTMENT_EVENT,
        PERMISSIONS.APPROVE_DEPARTMENT_EVENT,
        PERMISSIONS.VIEW_DEPARTMENT_EVENTS,
        PERMISSIONS.VIEW_DEPARTMENT_REPORTS
      );
    }

    if (this.isStaff() && this.isInCommunicationDepartment()) {
      permissions.push(
        PERMISSIONS.CREATE_COMMUNICATION_EVENT,
        PERMISSIONS.VIEW_COMMUNICATION_EVENTS
      );
    }

    if (this.isEmployee()) {
      permissions.push(
        PERMISSIONS.VIEW_EVENTS,
        PERMISSIONS.VIEW_DEPARTMENT_DATA
      );
    }

    return [...new Set(permissions)];
  }

  // =============== PRIVATE METHODS ===============

  private mapBackendResponseToAuthUser(response: BackendAuthResponse): AuthUser {
    const employeeId = this.extractNumericEmployeeId(response.employeeId);
    const departmentId = this.mapDepartmentGuidToId(response.departmentId);
    const fullName = `${response.firstName} ${response.lastName}`.trim();
    const username = response.employeeId || response.email.split('@')[0];

    // Map backend role string into our canonical role set.
    // Any role that is not Admin/Manager/Expert/Cameraman is treated as Employee.
    const backendRole = response.role;
    const knownRoles = [ROLES.Admin, ROLES.Manager, ROLES.Expert, ROLES.Cameraman];
    const mappedRole = knownRoles.includes(backendRole) ? backendRole : ROLES.Employee;

    return {
      employeeId: employeeId,
      adObjectId: response.userId,
      username: username,
      fullName: fullName,
      email: response.email,
      departmentId: departmentId,
      departmentGuid: response.departmentId,
      departmentName: this.getDepartmentName(departmentId),
      roles: [mappedRole]
    };
  }

  private extractNumericEmployeeId(employeeId: string): number {
    const numericPart = employeeId.replace(/\D/g, '');
    return numericPart ? parseInt(numericPart, 10) : 0;
  }

  private mapDepartmentGuidToId(departmentGuid: string): number {
    const departmentId = this.departmentGuidToIdMap[departmentGuid];

    if (departmentId) {
      return departmentId;
    }

    console.warn(`Unknown department GUID: ${departmentGuid}. Using GENERAL_STAFF as default.`);
    return DEPARTMENTS.GENERAL_STAFF;
  }

  private getDepartmentName(departmentId: number): string {
    return this.departmentIdToNameMap[departmentId] || 'Unknown Department';
  }

  private handleError(error: HttpErrorResponse | any): any {
    console.error('Auth Service Error:', error);

    let errorMessage = 'Login failed. Please try again.';
    const status = error.status || 0;

    if (status === 0) {
      errorMessage = 'Unable to connect to authentication server. Please check:\n• Server is running\n• Network connection\n• CORS configuration';
    } else if (status === 401) {
      errorMessage = 'Invalid Employee ID or password.';
    } else if (status === 403) {
      errorMessage = 'Your account does not have permission to access the system.';
    } else if (status === 400) {
      errorMessage = 'Invalid request. Please check your input.';
    } else if (status === 404) {
      errorMessage = 'Authentication service not found.';
    } else if (status === 500) {
      errorMessage = 'Server error. Please try again later.';
    }

    return {
      status: status,
      message: errorMessage,
      originalError: error
    };
  }

  private handleAuthSuccess(response: BackendAuthResponse): void {
    if (!this.isBrowser()) return;

    this.storage.setItem(this.TOKEN_KEY, response.token);

    const user = this.mapBackendResponseToAuthUser(response);
    this.storage.setItem(this.USER_KEY, JSON.stringify(user));

    try {
      const tokenPayload = JSON.parse(atob(response.token.split('.')[1]));
      if (tokenPayload.exp) {
        const expiryTime = tokenPayload.exp * 1000;
        this.storage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
      } else {
        const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
        this.storage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
      }
    } catch (e) {
      const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
      this.storage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
    }

    this.currentUserSubject.next(user);
  }

  private loadUserFromStorage(): void {
    if (!this.isBrowser()) return;

    try {
      const storedUser = this.storage.getItem(this.USER_KEY);
      const token = this.storage.getItem(this.TOKEN_KEY);

      if (storedUser && token) {
        // Check token expiration
        const isExpired = this.isTokenExpired();
        
        if (!isExpired) {
          const user: AuthUser = JSON.parse(storedUser);
          this.currentUserSubject.next(user);
          console.log('User loaded from storage:', user);
        } else {
          console.log('Token expired, clearing auth data');
          this.clearAuthData();
        }
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      this.clearAuthData();
    }
  }

  private isTokenExpired(): boolean {
    if (!this.isBrowser()) return false;

    const token = this.getToken();
    if (!token) return true;

    try {
      // Check if token has the correct format
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('Token does not have valid JWT format');
        return false; // Don't treat as expired if format is invalid
      }

      const payload = JSON.parse(atob(parts[1]));

      if (!payload.exp) {
        console.warn('Token has no exp field');
        // Check stored expiry as fallback
        const storedExpiry = this.storage.getItem(this.TOKEN_EXPIRY_KEY);
        if (storedExpiry) {
          return Date.now() >= parseInt(storedExpiry, 10);
        }
        return false; // treat as valid if no expiry info
      }

      return Date.now() >= payload.exp * 1000;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      // Don't treat as expired on parse error
      return false;
    }
  }

  public clearAuthData(): void {
    if (!this.isBrowser()) return;
    
    this.storage.removeItem(this.TOKEN_KEY);
    this.storage.removeItem(this.USER_KEY);
    this.storage.removeItem(this.TOKEN_EXPIRY_KEY);
    this.storage.removeItem('eep_refresh_token');
    this.currentUserSubject.next(null);
  }

  private setLoading(isLoading: boolean): void {
    this.isLoadingSubject.next(isLoading);
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}