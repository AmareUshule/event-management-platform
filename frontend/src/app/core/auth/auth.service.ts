import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

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
  role: string; // This comes as "Admin" from backend
  employeeId: string;
  departmentId: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private storage = inject(StorageService);
  
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

  // =============== PUBLIC API ===============

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
    
    if (token) {
      this.http.post(`${this.API_URL}/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        error: () => {} // Silent fail for logout
      });
    }
    
    this.clearAuthData();
    this.router.navigate(['/login'], {
      queryParams: { loggedOut: true }
    });
  }

  isAuthenticated(): boolean {
    const user = this.currentUserSubject.value;
    const token = this.getToken();
    
    if (!user || !token) {
      return false;
    }
    
    if (this.isTokenExpired()) {
      this.logout();
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
    return this.storage.getItem(this.TOKEN_KEY);
  }

  // =============== ROLE METHODS ===============

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles.includes(role) ?? false;
  }

  hasAnyRole(roles: string[]): boolean {
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

  // Get department GUID from current user (if needed for API calls)
  getDepartmentGuid(): string | null {
    const user = this.getCurrentUser();
    if (!user) return null;
    
    // You'll need to store this mapping or get it from the backend
    // This is a reverse lookup from department ID to GUID
    const reverseMap: Record<number, string> = {
      [DEPARTMENTS.INFORMATION_TECHNOLOGY]: '4cfbbaf2-e974-46de-b5bd-1187669f1204',
      // Add other mappings
    };
    
    return reverseMap[user.departmentId] || null;
  }

  // =============== PERMISSION METHODS ===============

  canCreateEvents(): boolean {
    if (this.isAdmin()) return true;
    if (this.isCommunicationManager()) return true;
    if (this.isDepartmentManager()) return true;
    if (this.isStaff() && this.isInCommunicationDepartment()) return true;
    return false;
  }

  canApproveEvents(): boolean {
    if (this.isAdmin()) return true;
    if (this.isCommunicationManager()) return true;
    if (this.isDepartmentManager()) return true;
    return false;
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

  /**
   * Maps the backend response to your AuthUser model
   */
  private mapBackendResponseToAuthUser(response: BackendAuthResponse): AuthUser {
  // Extract numeric employeeId from string (e.g., "ep710327" -> 710327)
  const employeeId = this.extractNumericEmployeeId(response.employeeId);
  
  // Map department GUID to internal department ID
  const departmentId = this.mapDepartmentGuidToId(response.departmentId);
  
  // Create full name from firstName and lastName
  const fullName = `${response.firstName} ${response.lastName}`.trim();
  
  // Create username from employeeId or email
  const username = response.employeeId || response.email.split('@')[0];
  
  // IMPORTANT: Direct mapping - backend sends "Admin", your ROLES.Admin is "Admin"
  // Make sure no transformation is happening
  const role = response.role; // This should be "Admin"
   
  
  return {
    employeeId: employeeId,
    adObjectId: response.userId,
    username: username,
    fullName: fullName,
    email: response.email,
    departmentId: departmentId,
    departmentName: this.getDepartmentName(departmentId),
    roles: [role] // Directly use the role from backend
  };
}

   

  /**
   * Extracts numeric part from employeeId string
   * Example: "ep710327" -> 710327
   */
  private extractNumericEmployeeId(employeeId: string): number {
    // Remove all non-numeric characters and parse
    const numericPart = employeeId.replace(/\D/g, '');
    return numericPart ? parseInt(numericPart, 10) : 0;
  }

  /**
   * Maps department GUID to internal department ID
   */
  private mapDepartmentGuidToId(departmentGuid: string): number {
    // Try to find the department ID from the mapping
    const departmentId = this.departmentGuidToIdMap[departmentGuid];
    
    if (departmentId) {
      return departmentId;
    }
    
    // If not found, log warning and return default
    console.warn(`Unknown department GUID: ${departmentGuid}. Using GENERAL_STAFF as default.`);
    return DEPARTMENTS.GENERAL_STAFF;
  }

  /**
   * Gets department name from department ID
   */
  private getDepartmentName(departmentId: number): string {
    return this.departmentIdToNameMap[departmentId] || 'Unknown Department';
  }

  /**
   * Handles HTTP errors
   */
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

  /**
   * Handles successful authentication
   */
  private handleAuthSuccess(response: BackendAuthResponse): void {
    // Store token
    this.storage.setItem(this.TOKEN_KEY, response.token);
    
    // Transform and store user data
    const user = this.mapBackendResponseToAuthUser(response);
    this.storage.setItem(this.USER_KEY, JSON.stringify(user));
    
    // Set token expiry from JWT if possible
    try {
      const tokenPayload = JSON.parse(atob(response.token.split('.')[1]));
      if (tokenPayload.exp) {
        const expiryTime = tokenPayload.exp * 1000; // Convert to milliseconds
        this.storage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
      } else {
        // If no exp in token, set default (24 hours)
        const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
        this.storage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
      }
    } catch (e) {
      // If can't decode token, set default expiry (24 hours)
      const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
      this.storage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
    }
    
    this.currentUserSubject.next(user);
  }

  /**
   * Loads user from storage on app initialization
   */
  private loadUserFromStorage(): void {
    try {
      const storedUser = this.storage.getItem(this.USER_KEY);
      const token = this.storage.getItem(this.TOKEN_KEY);
      
      if (storedUser && token && !this.isTokenExpired()) {
        const user: AuthUser = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
      } else if (this.isTokenExpired()) {
        this.clearAuthData();
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      this.clearAuthData();
    }
  }

  /**
   * Checks if token has expired
   */
  private isTokenExpired(): boolean {
    const expiry = this.storage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiry) return true;
    
    return Date.now() > parseInt(expiry, 10);
  }

  /**
   * Clears all authentication data
   */
  private clearAuthData(): void {
    this.storage.removeItem(this.TOKEN_KEY);
    this.storage.removeItem(this.USER_KEY);
    this.storage.removeItem(this.TOKEN_EXPIRY_KEY);
    this.storage.removeItem('eep_refresh_token');
    this.currentUserSubject.next(null);
  }

  /**
   * Sets loading state
   */
  private setLoading(isLoading: boolean): void {
    this.isLoadingSubject.next(isLoading);
  }
}