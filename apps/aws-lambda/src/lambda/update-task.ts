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

type TaskUpdateProperties = {
  title?: string;
  description?: string | null;
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'in_progress' | 'completed';
  assignedTo?: string | null;
  dueDate?: Date | null;
};

import { buildLambdaErrorResponse, getUpdateTaskUsecase } from './shared';
import { authenticateUser } from './shared/auth';
import { UnauthorizedError, ValidationApiError } from './shared/errors';

interface UpdateTaskBody {
  updateProperties: {
    title?: string;
    description?: string;
    priority?: number;
    status?: string;
    assignedTo?: string;
    dueDate?: string;
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

    let body: UpdateTaskBody;
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

    const projectId = event.pathParameters?.['projectId'];
    const taskId = event.pathParameters?.['taskId'];

    if (!projectId) {
      throw new ValidationApiError('Project ID is required');
    }
    if (!taskId) {
      throw new ValidationApiError('Task ID is required');
    }

    const authorizationContext: AuthorizationContext = {
      tenantId: user.tenantId,
      projectId,
      role: user.role
    };

    const statusValue = updateProperties.status;
    const updatePropertiesTyped: TaskUpdateProperties = {
      title: updateProperties.title,
      description: updateProperties.description ?? null,
      priority:
        updateProperties.priority === 2
          ? 'high'
          : updateProperties.priority === 1
            ? 'medium'
            : 'low',
      status:
        statusValue === 'pending' ||
        statusValue === 'in_progress' ||
        statusValue === 'completed'
          ? statusValue
          : undefined,
      assignedTo: updateProperties.assignedTo ?? null,
      dueDate: updateProperties.dueDate
        ? new Date(updateProperties.dueDate)
        : null
    };

    await getUpdateTaskUsecase().execute({
      authorizationContext,
      projectId,
      taskId,
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
