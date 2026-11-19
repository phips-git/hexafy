import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context
} from 'aws-lambda';

type TaskUpdateProperties = {
  title?: string | undefined;
  description?: string | null | undefined;
  priority?: 'low' | 'medium' | 'high' | undefined;
  status?: 'pending' | 'in_progress' | 'completed' | undefined;
  assignedTo?: string | null | undefined;
  dueDate?: Date | null | undefined;
};

import { buildLambdaErrorResponse, getUpdateTaskUseCase } from './shared';
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

    const statusValue = updateProperties.status;
    const updatePropertiesTyped: TaskUpdateProperties = {
      ...(updateProperties.title !== undefined && {
        title: updateProperties.title
      }),
      ...(updateProperties.description !== undefined && {
        description: updateProperties.description ?? null
      }),
      ...(updateProperties.priority !== undefined && {
        priority:
          updateProperties.priority === 2
            ? 'high'
            : updateProperties.priority === 1
              ? 'medium'
              : 'low'
      }),
      ...(statusValue === 'pending' ||
      statusValue === 'in_progress' ||
      statusValue === 'completed'
        ? { status: statusValue }
        : {}),
      ...(updateProperties.assignedTo !== undefined && {
        assignedTo: updateProperties.assignedTo ?? null
      }),
      ...(updateProperties.dueDate !== undefined && {
        dueDate: new Date(updateProperties.dueDate)
      })
    };

    await getUpdateTaskUseCase().execute({
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
