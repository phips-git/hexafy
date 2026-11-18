import type { TenantId } from '../../auth';

export interface Tenant {
  readonly id: TenantId;
  readonly name: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
