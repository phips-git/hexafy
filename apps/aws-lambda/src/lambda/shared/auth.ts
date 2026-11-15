import type { User } from '@hexafy/example-domain/domain';
import type { APIGatewayProxyEvent } from 'aws-lambda';

import { getGetAuthenticatedUserUsecase } from './usecase-factory';

export type { User as AuthenticatedUser };

export async function authenticateUser(
  event: APIGatewayProxyEvent
): Promise<User | null> {
  try {
    const usecase = getGetAuthenticatedUserUsecase();
    const user = await usecase.execute({
      headers: toStringHeaders(event.headers ?? {})
    });

    return isUser(user) ? user : null;
  } catch {
    return null;
  }
}

function toStringHeaders(
  value: Record<string, string | undefined>
): Record<string, string> {
  const headers: Record<string, string> = {};

  for (const [key, headerValue] of Object.entries(value)) {
    if (headerValue !== undefined) {
      headers[key] = headerValue;
    }
  }

  return headers;
}

function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'tenantId' in value &&
    'email' in value &&
    'name' in value &&
    'role' in value &&
    'createdAt' in value &&
    'updatedAt' in value
  );
}
