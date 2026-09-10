export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: number;
  username: string;
  displayName: string;
  role: UserRole;
}

export interface LoginCredentials {
  username: string;
  password: string;
}
