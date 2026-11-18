import type {
  ProjectId,
  Task,
  TaskId,
  UserId
} from '@hexafy/example-domain/domain';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context
} from 'aws-lambda';

import { buildLambdaErrorResponse } from './shared';
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

    const projectIdBranded = projectId as ProjectId;
    const assignedToBranded = assignedTo ? (assignedTo as UserId) : null;

    const task: Task = {
      id: `task_${Date.now()}` as TaskId,
      projectId: projectIdBranded,
      title,
      description: description ?? null,
      priority: priority === 2 ? 'high' : priority === 1 ? 'medium' : 'low',
      status: 'pending',
      assignedTo: assignedToBranded,
      dueDate: dueDate ? new Date(dueDate) : null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: task
      })
    };
  } catch (error) {
    return buildLambdaErrorResponse(error, requestId);
  }
};
