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

type ProjectUpdateProperties = {
  name?: string;
  description?: string | null;
};

import { buildLambdaErrorResponse, getUpdateProjectUsecase } from './shared';
import { authenticateUser } from './shared/auth';
import { UnauthorizedError, ValidationApiError } from './shared/errors';

interface UpdateProjectBody {
  updateProperties: {
    name?: string;
    description?: string;
  };
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

    let body: UpdateProjectBody;
    if (!event.body) {
      throw new ValidationApiError('Request body is required');
    }

    try {
      body = JSON.parse(event.body);
    } catch {
      throw new ValidationApiError('Invalid JSON in request body');
    }

    const { updateProperties } = body;
    if (!updateProperties || Object.keys(updateProperties).length === 0) {
      throw new ValidationApiError('At least one field to update is required');
    }

    const projectId = event.pathParameters?.['id'];
    if (!projectId) {
      throw new ValidationApiError('Project ID is required');
    }

    const authorizationContext: AuthorizationContext = {
      tenantId: user.tenantId,
      projectId,
      role: user.role
    };

    const updatePropertiesTyped: ProjectUpdateProperties = {
      name: updateProperties.name,
      description: updateProperties.description ?? null
    };

    await getUpdateProjectUsecase().execute({
      authorizationContext,
      projectId,
      updateProperties: updatePropertiesTyped
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
