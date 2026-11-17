import type { Brand } from '@hexafy/core/domain';

export type UserId = Brand<string, 'UserId'>;
export type TenantId = Brand<string, 'TenantId'>;

export type UserRole = 'admin' | 'member' | 'guest';

export interface User {
  readonly id: UserId;
  readonly tenantId: TenantId;
  readonly email: string;
  readonly name: string | null;
  readonly role: UserRole;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export type UserCreationProperties = Pick<User, 'email' | 'name' | 'role'>;
export type ValidUserCreationProperties = Brand<
  UserCreationProperties,
  'ValidUserCreationProperties'
>;

export type UserUpdateProperties = Partial<Pick<User, 'name' | 'role'>>;
