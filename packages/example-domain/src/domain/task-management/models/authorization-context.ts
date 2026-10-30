import type { TenantId, UserId } from '../auth/models';
import type { ProjectId, TaskId } from './task';

export interface AuthorizationContext {
  readonly tenantId: TenantId;
  readonly userId: UserId;
  readonly projectId?: ProjectId;
  readonly taskId?: TaskId;
}

export function extractTenantId(context: AuthorizationContext): TenantId {
  return context.tenantId;
}

export function extractUserId(context: AuthorizationContext): UserId {
  return context.userId;
}
