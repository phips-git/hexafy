import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context
} from 'aws-lambda';

type AuthorizationContext = {
  tenantId: string;
  projectId: string | null;
  role: string;
};

import { buildLambdaErrorResponse, getDeleteProjectUsecase } from './shared';
import { authenticateUser } from './shared/auth';

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const requestId = context.awsRequestId;

  try {
    const user = await authenticateUser(event);
    if (!user) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Unauthorized',
          code: 'UNAUTHORIZED',
          requestId
        })
      };
    }

    const projectId = event.pathParameters?.['id'];
    if (!projectId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Project ID is required',
          code: 'VALIDATION_ERROR',
          requestId
        })
      };
    }

    const authorizationContext: AuthorizationContext = {
      tenantId: user.tenantId,
      projectId,
      role: user.role
    };

    await getDeleteProjectUsecase().execute({
      authorizationContext,
      projectId
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    return buildLambdaErrorResponse(error, requestId);
  }
};
