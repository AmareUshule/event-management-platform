// src/app/core/services/employee.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiUser, Employee } from '../models/employee.model';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Get HTTP headers with authorization token
   */
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Get all users with optional role filter
   * @param role - Optional role to filter users (e.g., 'Expert', 'Cameraman')
   */
  getUsers(role?: string): Observable<Employee[]> {
    let params = new HttpParams();
    
    if (role) {
      params = params.set('role', role);
    }

    console.log('🔍 Fetching users from:', `${this.apiUrl}/api/Auth/users`);
    console.log('🔍 Role filter:', role || 'all');

    return this.http.get<any[]>(`${this.apiUrl}/api/Auth/users`, { 
      headers: this.getHeaders(),
      params 
    }).pipe(
      map(users => {
        console.log(`✅ Received ${users?.length || 0} users from API`);
        if (!Array.isArray(users)) {
          console.warn('⚠️ API did not return an array of users:', users);
          return [];
        }
        return this.mapToEmployees(users);
      }),
      catchError(error => {
        console.error('❌ Error fetching users:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get users by specific role (convenience method)
   */
  getUsersByRole(role: string): Observable<Employee[]> {
    return this.getUsers(role);
  }

  /**
   * Get experts (users with role=Expert)
   */
  getExperts(): Observable<Employee[]> {
    return this.getUsers('Expert');
  }

  /**
   * Get cameramen (users with role=Cameraman)
   */
  getCameramen(): Observable<Employee[]> {
    return this.getUsers('Cameraman');
  }

  /**
   * Get all employees (users) without role filter
   */
  getAllEmployees(): Observable<Employee[]> {
    return this.getUsers();
  }

  /**
   * Map API users to Employee interface
   */
  private mapToEmployees(users: any[]): Employee[] {
    return users.map(user => {
      // Handle potential field name variations (id vs userId)
      const id = user.id || user.userId || '';
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      
      return {
        id: id,
        firstName: firstName,
        lastName: lastName,
        name: (user.name || `${firstName} ${lastName}`).trim() || 'Unknown User',
        email: user.email || '',
        employeeId: user.employeeId || '',
        departmentId: user.departmentId || '',
        role: user.role || ''
      };
    });
  }

  /**
   * Search employees by name or email
   */
  searchEmployees(query: string, role?: string): Observable<Employee[]> {
    return this.getUsers(role).pipe(
      map(employees => employees.filter(emp => 
        emp.name.toLowerCase().includes(query.toLowerCase()) ||
        emp.email.toLowerCase().includes(query.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(query.toLowerCase())
      ))
    );
  }

  /**
   * Get employee by ID
   */
  getEmployeeById(id: string): Observable<Employee | undefined> {
    return this.getUsers().pipe(
      map(employees => employees.find(emp => emp.id === id || emp.employeeId === id))
    );
  }
}