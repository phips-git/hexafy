import type { TenantId as TenantIdFromAuth } from '../../auth/models';

export { TenantIdFromAuth };

export interface Tenant {
  readonly id: TenantIdFromAuth;
  readonly name: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
