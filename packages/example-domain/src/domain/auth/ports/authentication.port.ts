import type { User } from '../models';

export interface AuthenticationPort {
  authenticate(email: string, password: string): Promise<User>;
  register(email: string, password: string, name?: string): Promise<User>;
  validateToken(token: string): Promise<User | null>;
}
