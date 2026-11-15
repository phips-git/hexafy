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

type ProjectCreationProperties = {
  name: string;
  description: string | null;
  ownerId?: string;
};

import { buildLambdaErrorResponse, getCreateProjectUsecase } from './shared';
import { authenticateUser } from './shared/auth';
import { UnauthorizedError, ValidationApiError } from './shared/errors';

interface CreateProjectBody {
  name: string;
  description?: string;
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

    let body: CreateProjectBody;
    if (!event.body) {
      throw new ValidationApiError('Request body is required');
    }

    try {
      body = JSON.parse(event.body);
    } catch {
      throw new ValidationApiError('Invalid JSON in request body');
    }

    const { name, description } = body;
    if (!name) {
      throw new ValidationApiError('Project name is required');
    }

    const authorizationContext: AuthorizationContext = {
      tenantId: user.tenantId,
      projectId: null,
      role: user.role
    };

    const creationProperties: ProjectCreationProperties = {
      name,
      description: description ?? null,
      ownerId: user.id
    };

    await getCreateProjectUsecase().execute({
      authorizationContext,
      creationProperties
    });

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    return buildLambdaErrorResponse(error, requestId);
  }
};
