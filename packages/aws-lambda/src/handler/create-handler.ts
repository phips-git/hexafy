/**
 * Lambda handler factory - creates Lambda handlers from use cases
 *
 * This provides a clean way to compose use cases with Lambda-specific concerns
 * (input parsing, error handling, response formatting)
 */
import type { UseCase } from '@hexafy/core/application';
import { getDomainErrorCode, isDomainError } from '@hexafy/core/domain';
import type { Context as LambdaContext } from 'aws-lambda';

/** Type aliases for AWS Lambda */
export type Context = LambdaContext;

/** Configuration for Lambda handler */
export interface HandlerConfig<Input, Output> {
  /** The use case to execute */
  useCase: UseCase<Input, Output>;

  /** Transform Lambda event into use case input */
  inputTransformer: (event: APIGatewayEvent, context: Context) => Input;

  /**
   * Transform use case output into API Gateway response
   *
   * @default Standard JSON response formatter
   */
  responseFormatter?: (output: Output) => APIGatewayResponse;

  /**
   * Transform errors into API Gateway error response
   *
   * @default Built-in error formatter
   */
  errorFormatter?: (error: Error) => APIGatewayErrorResponse;

  /** Optional error handler for logging/monitoring */
  onError?: (error: Error, context: Context) => void;
}

/** API Gateway REST API event */
export interface APIGatewayEvent {
  httpMethod: string;
  path: string;
  body: string | null;
  headers: Record<string, string>;
  queryParameters: Record<string, string> | null;
  pathParameters: Record<string, string> | null;
  stageVariables: Record<string, string> | null;
}

/** API Gateway response */
export interface APIGatewayResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
  isBase64Encoded?: boolean;
}

/** API Gateway error response */
export interface APIGatewayErrorResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}

/**
 * Create a Lambda handler from a use case.
 *
 * This is the primary entry point for using @hexafy/aws-lambda. It wires
 * together a use case with event transformation and response formatting.
 *
 * @example
 *   ```typescript
 *   export const handler = createLambdaHandler({
 *     useCase: new CreateUserUseCase(),
 *     inputTransformer: parseJsonBody,
 *     responseFormatter: formatJsonResponse
 *   });
 *   ```;
 */
export function createLambdaHandler<Input, Output>(
  config: HandlerConfig<Input, Output>
): (event: APIGatewayEvent, context: Context) => Promise<APIGatewayResponse> {
  const {
    useCase,
    inputTransformer,
    responseFormatter = formatJsonResponse,
    errorFormatter = formatError,
    onError
  } = config;

  return async (event, context) => {
    // Transform event to use case input
    const input = inputTransformer(event, context);

    // Execute use case - returns Result
    const result = await useCase.execute(input);

    // Handle result
    if (result.success) {
      return responseFormatter(result.value);
    }

    // Format error response
    const error = result.error;

    // Log error if handler provided
    if (onError) {
      onError(error, context);
    }

    // Format error response
    const formattedError = errorFormatter(error);

    // For domain-like errors, include stable code metadata
    if (isDomainError(error)) {
      const code = getDomainErrorCode(error);
      const timestamp = readErrorTimestamp(error);

      formattedError.body = JSON.stringify({
        success: false,
        error: error.message,
        ...(code && { code }),
        ...(timestamp && { timestamp })
      });
    }

    return formattedError;
  };
}

function readErrorTimestamp(error: Error): string | undefined {
  const maybeTimestamp = (error as { timestamp?: unknown }).timestamp;
  if (maybeTimestamp instanceof Date) {
    return maybeTimestamp.toISOString();
  }
  return undefined;
}

/** Standard JSON response formatter */
export function formatJsonResponse<T>(output: T): APIGatewayResponse {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      success: true,
      data: output
    })
  };
}

/**
 * Standard error response formatter.
 *
 * Automatically detects domain errors and formats them with appropriate status
 * codes. Falls back to 500 for unexpected errors.
 *
 * @example
 *   ```typescript
 *   const errorResponse = formatError(new ValidationError('Invalid email'));
 *   // Returns: { statusCode: 400, body: '{ success: false, code: "VALIDATION_ERROR", ... }' }
 *   ```;
 */
export function formatError(error: Error): APIGatewayErrorResponse {
  // Handle domain errors
  if (isDomainError(error)) {
    const code = getDomainErrorCode(error);
    const timestamp = readErrorTimestamp(error);
    const statusCode = getDomainErrorStatusCode(error);

    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: error.message,
        code,
        ...(timestamp && { timestamp })
      })
    };
  }

  // Handle HTTP 404 errors
  if (error.message.includes('404') || error.name === 'NotFoundError') {
    return {
      statusCode: 404,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }

  // Handle HTTP 400 errors
  if (
    error.message.includes('400') ||
    error.name === 'ValidationError' ||
    error.message.includes('required')
  ) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }

  // Default server error
  return {
    statusCode: 500,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      success: false,
      error: 'Internal server error'
    })
  };
}

/** Extract status code from domain error or HTTP error messages */
function getDomainErrorStatusCode(error: Error): number {
  if (error instanceof Error) {
    // Check if error name indicates a specific HTTP code
    if (error.name === 'NotFoundError' || error.message.includes('not found')) {
      return 404;
    }
    if (
      error.name === 'ValidationError' ||
      error.message.includes('required')
    ) {
      return 400;
    }
    if (error.name === 'UnauthorizedError') {
      return 401;
    }
    if (error.name === 'ForbiddenError') {
      return 403;
    }
  }

  return 500;
}
