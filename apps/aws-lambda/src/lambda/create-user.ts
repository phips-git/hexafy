import type {
  TenantId,
  User,
  UserId,
  UserRole
} from '@hexafy/example-domain/domain';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context
} from 'aws-lambda';

import { buildLambdaErrorResponse } from './shared';
import { authenticateUser } from './shared/auth';
import { UnauthorizedError, ValidationApiError } from './shared/errors';

interface CreateUserBody {
  name: string;
  email: string;
  password: string;
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const requestId = context.awsRequestId;

  try {
    const user = await authenticateUser(event);
    if (!user) {
      throw new UnauthorizedError();
    }

    let body: CreateUserBody;
    if (!event.body) {
      throw new ValidationApiError('Request body is required');
    }

    try {
      body = JSON.parse(event.body);
    } catch {
      throw new ValidationApiError('Invalid JSON in request body');
    }

    const userId = `user_${Date.now()}` as UserId;
    const tenantId = `tenant_${Date.now()}` as TenantId;
    const role = (body.name ? 'member' : 'guest') as UserRole;

    const result: User = {
      id: userId,
      tenantId,
      email: body.email,
      name: body.name ?? null,
      role,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: {
          id: result.id,
          email: result.email,
          name: result.name,
          token: `mock_token_${result.id}`
        }
      })
    };
  } catch (error) {
    return buildLambdaErrorResponse(error, requestId);
  }
};
