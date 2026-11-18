import type { User, UserId } from '../../domain/auth/models';

export interface UserPort {
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
}
