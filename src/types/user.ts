export type UserRole = 'owner' | 'admin' | 'employee';

export interface UserProfile {
  initials: string;
  name: string;
  roleLabel: string;
  venueLabel?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  roleLabel: string;
  memberId?: string;
  venue?: string;
  rate?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
