import { getDomainErrorCode, isDomainError } from '@hexafy/core/domain';

export interface LambdaErrorResponse {
  statusCode: number;
  headers: { 'Content-Type': string };
  body: string;
}

export function buildLambdaErrorResponse(
  error: unknown,
  requestId: string
): LambdaErrorResponse {
  if (error instanceof Error && error.name === 'UnauthorizedError') {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: error.message,
        code: 'UNAUTHORIZED',
        requestId
      })
    };
  }

  if (error instanceof Error && error.name === 'ValidationApiError') {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: error.message,
        code: 'VALIDATION_ERROR',
        requestId
      })
    };
  }

  if (isDomainError(error)) {
    const domainErrorCode = getDomainErrorCode(error) ?? error.name;
    const statusCode = getStatusCodeForDomainError(error);
    return {
      statusCode,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: error.message,
        code: domainErrorCode,
        requestId
      })
    };
  }

  return {
    statusCode: 500,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      error: error instanceof Error ? error.message : String(error),
      code: 'INTERNAL_ERROR',
      requestId
    })
  };
}

function getStatusCodeForDomainError(error: Error): number {
  switch (getDomainErrorCode(error)) {
    case 'UNAUTHORIZED_ERROR':
      return 401;
    case 'FORBIDDEN_ERROR':
      return 403;
    case 'NOT_FOUND_ERROR':
      return 404;
    case 'VALIDATION_ERROR':
      return 400;
    case 'CONFLICT_ERROR':
      return 409;
    case 'INTERNAL_SERVER_ERROR':
    case 'INVARIANT_ERROR':
    case 'INFRASTRUCTURE_ERROR':
      return 500;
    case 'EXTERNAL_SERVICE_ERROR':
      return 502;
    default:
      return 500;
  }
}
