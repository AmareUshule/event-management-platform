export interface AuthUser {
  employeeId: number;
  adObjectId: string;
  username: string;
  fullName: string;
  email: string;
  departmentId: number;
  departmentName?: string;
  roles: string[];
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
  refreshToken?: string;
  expiresIn?: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}