 

export interface AuthResponse {
  token: string;
  user: AuthUser;
  refreshToken?: string;
  expiresIn?: number;
}

 
// auth-user.model.ts
export interface LoginCredentials {
  employeeId: string;  // This should be employeeId, not username
  password: string;
}

export interface AuthUser {
  employeeId: number;
  adObjectId: string;
  username: string;
  fullName: string;
  email: string;
  departmentId: number;
  departmentGuid: string;
  departmentName: string;
  roles: string[];
  permissions?: string[];
}