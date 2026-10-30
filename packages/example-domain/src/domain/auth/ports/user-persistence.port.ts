import type { UserId } from '../models';

export interface UserPort {
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
}
