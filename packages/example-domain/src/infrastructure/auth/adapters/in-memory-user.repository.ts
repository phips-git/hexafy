import type { Brand } from '@hexafy/core/domain';

import type { User } from '../../domain/auth/models';
import type { UserPort } from '../../domain/auth/ports';

type BrandedUserId = Brand<string, 'UserId'>;
type BrandedTenantId = Brand<string, 'TenantId'>;

export class InMemoryUserRepository implements UserPort {
  private readonly users: Map<BrandedUserId, User> = new Map();

  async findById(id: string): Promise<User | null> {
    return this.users.get(id as BrandedUserId) ?? null;
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
