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

type TaskCreationProperties = {
  title: string;
  description: string | null;
  priority?: 'low' | 'medium' | 'high';
  assignedTo?: string | null;
  dueDate?: Date | null;
};

import { buildLambdaErrorResponse, getCreateTaskUsecase } from './shared';
import { authenticateUser } from './shared/auth';
import { UnauthorizedError, ValidationApiError } from './shared/errors';

interface CreateTaskBody {
  title: string;
  description?: string;
  priority?: number;
  assignedTo?: string;
  dueDate?: string;
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

    let body: CreateTaskBody;
    if (!event.body) {
      throw new ValidationApiError('Request body is required');
    }

    try {
      body = JSON.parse(event.body);
    } catch {
      throw new ValidationApiError('Invalid JSON in request body');
    }

    const { title, description, priority, assignedTo, dueDate } = body;
    if (!title) {
      throw new ValidationApiError('Task title is required');
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

    const creationProperties: TaskCreationProperties = {
      title,
      description: description ?? null,
      priority: priority === 2 ? 'high' : priority === 1 ? 'medium' : 'low',
      assignedTo: assignedTo ?? null,
      dueDate: dueDate ? new Date(dueDate) : null
    };

    await getCreateTaskUsecase().execute({
      authorizationContext,
      projectId,
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
