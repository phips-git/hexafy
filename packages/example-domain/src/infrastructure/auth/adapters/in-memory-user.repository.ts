import type { User } from '../../domain/auth/models';
import type { UserPort } from '../../domain/auth/ports';

export class InMemoryUserRepository implements UserPort {
  private readonly users: Map<string, User> = new Map();

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return (
      Array.from(this.users.values()).find((user) => user.email === email) ??
      null
    );
  }

  async save(user: User): Promise<User> {
    this.users.set(user.id, {
      ...user,
      updatedAt: new Date()
    });
    return user;
  }
}
