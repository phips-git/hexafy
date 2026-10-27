/**
 * Lambda handler factory - creates Lambda handlers from use cases
 *
 * This provides a clean way to compose use cases with Lambda-specific
 * concerns (input parsing, error handling, response formatting)
 */
import { HexagonalError, UseCase } from '@hex/core';
import type { Context as LambdaContext } from 'aws-lambda';

/**
 * Type aliases for AWS Lambda
 */
export type Context = LambdaContext;

/**
 * Configuration for Lambda handler
 */
export interface HandlerConfig<Input, Output> {
  /**
   * The use case to execute
   */
  useCase: UseCase<Input, Output>;

  /**
   * Transform Lambda event into use case input
   */
  inputTransformer: (event: APIGatewayEvent, context: Context) => Input;

  /**
   * Transform use case output into API Gateway response
   * @default Standard JSON response formatter
   */
  responseFormatter?: (output: Output) => APIGatewayResponse;

  /**
   * Transform errors into API Gateway error response
   * @default Built-in error formatter
   */
  errorFormatter?: (error: Error) => APIGatewayErrorResponse;

  /**
   * Optional error handler for logging/monitoring
   */
  onError?: (error: Error, context: Context) => void;
}

/**
 * API Gateway REST API event
 */
export interface APIGatewayEvent {
  httpMethod: string;
  path: string;
  body: string | null;
  headers: Record<string, string>;
  queryParameters: Record<string, string> | null;
  pathParameters: Record<string, string> | null;
  stageVariables: Record<string, string> | null;
}

/**
 * API Gateway response
 */
export interface APIGatewayResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
  isBase64Encoded?: boolean;
}

/**
 * API Gateway error response
 */
export interface APIGatewayErrorResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}

/**
 * Create a Lambda handler from a use case
 *
 * This is the primary entry point for using @hex/aws-lambda
 *
 * @example
 * ```typescript
 * export const handler = createLambdaHandler({
 *   useCase: new CreateUserUseCase(),
 *   inputTransformer: parseApiGatewayBody,
 *   responseFormatter: formatJsonResponse,
 *   errorFormatter: formatErrorResponse,
 * });
 * ```
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
    try {
      // Transform event to use case input
      const input = inputTransformer(event, context);

      // Execute use case
      const output = await useCase.execute(input);

      // Format success response
      return responseFormatter(output);
    } catch (error) {
      // Log error if handler provided
      if (onError) {
        onError(error as Error, context);
      }

      // Format error response
      const formattedError = errorFormatter(error as Error);

      // For HexagonalError, include code in body
      if (error instanceof HexagonalError) {
        formattedError.body = JSON.stringify({
          success: false,
          error: (error as HexagonalError).message,
          code: (error as HexagonalError).code,
          timestamp: (error as HexagonalError).timestamp.toISOString()
        });
      }

      return formattedError;
    }
  };
}

/**
 * Standard JSON response formatter
 */
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
 * Standard error response formatter
 */
export function formatError(error: Error): APIGatewayErrorResponse {
  // Handle specific error types
  if (error.message.includes('400')) {
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

  if (error.message.includes('404')) {
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
