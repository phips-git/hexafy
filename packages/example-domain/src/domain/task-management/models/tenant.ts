import type { Brand } from '@hexafy/core/brand';

import type { UserId } from '../../auth/models';

export type TenantId = Brand<string, 'TenantId'>;

export interface Tenant {
  readonly id: TenantId;
  readonly name: string;
  readonly ownerId: UserId;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export type TenantCreationProperties = Pick<Tenant, 'name' | 'ownerId'>;
export type ValidTenantCreationProperties = Brand<
  TenantCreationProperties,
  'ValidTenantCreationProperties'
>;
