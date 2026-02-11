import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, of, defer } from 'rxjs';
import { catchError, map, tap, delay } from 'rxjs/operators';

import { AuthUser, AuthResponse, LoginCredentials } from '../models/auth-user.model';
import { StorageService } from '../services/storage.service';
import { environment } from '../../../environments/environment';

import { DEPARTMENTS } from '../constants/departments.constants';
import { ROLES } from '../constants/roles.constants';
import { PERMISSIONS } from '../constants/permissions.constants';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private storage = inject(StorageService);
  
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'eep_auth_token';
  private readonly USER_KEY = 'eep_auth_user';
  private readonly TOKEN_EXPIRY_KEY = 'eep_token_expiry';
  
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  constructor() {
    this.loadUserFromStorage();
  }

  // =============== PUBLIC API ===============

  login(credentials: LoginCredentials): Observable<AuthUser> {
    this.setLoading(true);
    
    return this.authenticate(credentials).pipe(
      tap(response => {
        this.handleAuthSuccess(response);
        this.setLoading(false);
      }),
      map(response => response.user),
      catchError(error => {
        this.setLoading(false);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    if (!environment.mockAuth) {
      this.http.post(`${this.API_URL}/logout`, {}).subscribe({
        error: () => {}
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
    return this.hasRole(ROLES.ADMIN);
  }

  isManager(): boolean {
    return this.hasRole(ROLES.MANAGER);
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
    return this.hasRole(ROLES.STAFF);
  }

  isEmployee(): boolean {
    return this.hasRole(ROLES.EMPLOYEE);
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

    // Admin: Full access
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

    // Manager with Communication Department
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

    // Manager with other departments
    if (this.isDepartmentManager()) {
      permissions.push(
        PERMISSIONS.CREATE_DEPARTMENT_EVENT,
        PERMISSIONS.APPROVE_DEPARTMENT_EVENT,
        PERMISSIONS.VIEW_DEPARTMENT_EVENTS,
        PERMISSIONS.VIEW_DEPARTMENT_REPORTS
      );
    }

    // Staff (Communication Expert / Camera Man)
    if (this.isStaff() && this.isInCommunicationDepartment()) {
      permissions.push(
        PERMISSIONS.CREATE_COMMUNICATION_EVENT,
        PERMISSIONS.VIEW_COMMUNICATION_EVENTS
      );
    }

    // Employee (basic viewer)
    if (this.isEmployee()) {
      permissions.push(
        PERMISSIONS.VIEW_EVENTS,
        PERMISSIONS.VIEW_DEPARTMENT_DATA
      );
    }

    return [...new Set(permissions)];
  }

  simulateLogin(): Observable<AuthUser> {
    if (environment.mockAuth) {
      const credentials: LoginCredentials = {
        username: 'amare.ushule',
        password: 'demo123'
      };
      
      return this.login(credentials);
    }
    
    this.router.navigate(['/login']);
    return throwError(() => new Error('Auto-login not available in production'));
  }

  // =============== PRIVATE METHODS ===============

  private authenticate(credentials: LoginCredentials): Observable<AuthResponse> {
    if (environment.mockAuth) {
      return this.mockAuthentication(credentials);
    }
    
    return this.realAuthentication(credentials);
  }

  private realAuthentication(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      catchError(error => {
        const structuredError = {
          status: error.status || 500,
          message: error.message || 'Authentication failed'
        };
        return throwError(() => structuredError);
      })
    );
  }

  private mockAuthentication(credentials: LoginCredentials): Observable<AuthResponse> {
    return defer(() => {
      try {
        const user = this.validateCredentials(credentials);
        
        return of({
          token: this.generateMockToken(user),
          user: user,
          refreshToken: this.generateRefreshToken(),
          expiresIn: 3600
        }).pipe(delay(800));
        
      } catch (error) {
        return throwError(() => error).pipe(delay(800));
      }
    });
  }

  private validateCredentials(credentials: LoginCredentials): AuthUser {
    // Mock user database
    const mockUsers: Array<AuthUser & { password: string }> = [
      {
        employeeId: 1001,
        adObjectId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        username: 'admin.user',
        fullName: 'System Administrator',
        email: 'admin@eep.com',
        departmentId: DEPARTMENTS.INFORMATION_TECHNOLOGY,
        departmentName: 'Information Technology',
        roles: [ROLES.ADMIN],
        password: 'demo123'
      },
      {
        employeeId: 1002,
        adObjectId: 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
        username: 'com.manager',
        fullName: 'Communication Manager',
        email: 'com.manager@eep.com',
        departmentId: DEPARTMENTS.COMMUNICATION,
        departmentName: 'Communication',
        roles: [ROLES.MANAGER],
        password: 'demo123'
      },
      {
        employeeId: 1003,
        adObjectId: 'c3d4e5f6-g7h8-9012-cdef-345678901234',
        username: 'it.manager',
        fullName: 'IT Department Manager',
        email: 'it.manager@eep.com',
        departmentId: DEPARTMENTS.INFORMATION_TECHNOLOGY,
        departmentName: 'Information Technology',
        roles: [ROLES.MANAGER],
        password: 'demo123'
      },
      {
        employeeId: 1004,
        adObjectId: 'd4e5f6g7-h8i9-0123-defg-456789012345',
        username: 'hr.manager',
        fullName: 'HR Department Manager',
        email: 'hr.manager@eep.com',
        departmentId: DEPARTMENTS.HUMAN_RESOURCES,
        departmentName: 'Human Resources',
        roles: [ROLES.MANAGER],
        password: 'demo123'
      },
      {
        employeeId: 1005,
        adObjectId: 'e5f6g7h8-i9j0-1234-efgh-567890123456',
        username: 'com.staff',
        fullName: 'Communication Expert',
        email: 'com.staff@eep.com',
        departmentId: DEPARTMENTS.COMMUNICATION,
        departmentName: 'Communication',
        roles: [ROLES.STAFF],
        password: 'demo123'
      },
      {
        employeeId: 1006,
        adObjectId: 'f6g7h8i9-j0k1-2345-fghi-678901234567',
        username: 'employee.user',
        fullName: 'Regular Employee',
        email: 'employee@eep.com',
        departmentId: DEPARTMENTS.GENERAL_STAFF,
        departmentName: 'General Staff',
        roles: [ROLES.EMPLOYEE],
        password: 'demo123'
      }
    ];

    const user = mockUsers.find(u => 
      u.username.toLowerCase() === credentials.username.toLowerCase()
    );

    if (!user) {
      throw {
        status: 401,
        message: 'Invalid username or password'
      };
    }

    if (user.password !== credentials.password) {
      throw {
        status: 401,
        message: 'Invalid username or password'
      };
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  private generateMockToken(user: AuthUser): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: user.employeeId,
      username: user.username,
      roles: user.roles,
      department: user.departmentId,
      departmentName: user.departmentName,
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000)
    }));
    const signature = 'mock-signature-' + Date.now();
    
    return `${header}.${payload}.${signature}`;
  }

  private generateRefreshToken(): string {
    return 'refresh-token-' + Date.now() + '-' + Math.random().toString(36).substr(2);
  }

  private handleAuthSuccess(response: AuthResponse): void {
    this.storage.setItem(this.TOKEN_KEY, response.token);
    this.storage.setItem(this.USER_KEY, JSON.stringify(response.user));
    
    if (response.expiresIn) {
      const expiryTime = Date.now() + (response.expiresIn * 1000);
      this.storage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
    }
    
    if (response.refreshToken) {
      this.storage.setItem('eep_refresh_token', response.refreshToken);
    }
    
    this.currentUserSubject.next(response.user);
  }

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

  private isTokenExpired(): boolean {
    const expiry = this.storage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiry) return true;
    
    return Date.now() > parseInt(expiry, 10);
  }

  private clearAuthData(): void {
    this.storage.removeItem(this.TOKEN_KEY);
    this.storage.removeItem(this.USER_KEY);
    this.storage.removeItem(this.TOKEN_EXPIRY_KEY);
    this.storage.removeItem('eep_refresh_token');
    this.currentUserSubject.next(null);
  }

  private setLoading(isLoading: boolean): void {
    this.isLoadingSubject.next(isLoading);
  }
}