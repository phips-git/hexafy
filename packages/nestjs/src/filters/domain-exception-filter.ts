/** Global exception filter for application errors */
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch } from '@nestjs/common';

interface HttpResponseLike {
  status(code: number): {
    json(body: unknown): unknown;
  };
}

import {
  ConflictError,
  NotFoundError,
  ValidationError
} from '@hexafy/core/domain';

import {
  ApplicationError,
  ExternalServiceError,
  HttpForbiddenError,
  HttpUnauthorizedError,
  InfrastructureError,
  InternalServerError
} from '../domain/errors';

/**
 * Global exception filter for HTTP-specific errors.
 *
 * Catches HTTP-related domain errors (Unauthorized, Forbidden) and converts
 * them to appropriate HTTP responses with proper status codes.
 *
 * @example
 *   ```typescript
 *   app.useGlobalFilters(new HttpExceptionFilter());
 *   ```;
 */
@Catch(HttpUnauthorizedError, HttpForbiddenError)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(
    exception: HttpUnauthorizedError | HttpForbiddenError,
    host: ArgumentsHost
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<HttpResponseLike>();

    const status = exception instanceof HttpUnauthorizedError ? 401 : 403;

    response.status(status).json({
      success: false,
      error: {
        code: exception.code,
        message: exception.message,
        ...(exception.context && { context: exception.context })
      }
    });
  }
}

/**
 * Global exception filter for domain/application errors.
 *
 * Catches all application errors that don't have specific HTTP codes and
 * returns a 400 Bad Request response. This is the default handler for business
 * logic errors like validation failures and conflicts.
 *
 * @example
 *   ```typescript
 *   app.useGlobalFilters(new DomainExceptionFilter());
 *   ```;
 */
@Catch(ApplicationError, Error)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<HttpResponseLike>();

    const status = this.getStatusCode(exception);

    response.status(status).json({
      success: false,
      error: {
        code: this.getErrorCode(exception),
        message: exception.message,
        ...(exception instanceof ApplicationError &&
          exception.context && {
            context: exception.context
          })
      }
    });
  }

  private getStatusCode(exception: Error): number {
    if (exception instanceof HttpUnauthorizedError) return 401;
    if (exception instanceof HttpForbiddenError) return 403;
    if (
      exception instanceof NotFoundError ||
      exception.name === 'NotFoundError'
    )
      return 404;
    if (
      exception instanceof ConflictError ||
      exception.name === 'ConflictError'
    )
      return 409;
    if (
      exception instanceof ValidationError ||
      exception.name === 'ValidationError'
    )
      return 400;
    return 400;
  }

  private getErrorCode(exception: Error): string {
    if (exception instanceof ApplicationError) return exception.code;
    if (exception instanceof NotFoundError) return 'NOT_FOUND_ERROR';
    if (exception instanceof ConflictError) return 'CONFLICT_ERROR';
    if (exception instanceof ValidationError) return 'VALIDATION_ERROR';
    return 'APPLICATION_ERROR';
  }
}

/** Global exception filter for unhandled errors */
@Catch(Error)
export class UnhandledExceptionFilter implements ExceptionFilter {
  catch(_exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<HttpResponseLike>();

    response.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
}

/** Global exception filter for infrastructure errors */
@Catch(InfrastructureError, ExternalServiceError, InternalServerError)
export class InfrastructureExceptionFilter implements ExceptionFilter {
  catch(
    exception: InfrastructureError | ExternalServiceError | InternalServerError,
    host: ArgumentsHost
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<HttpResponseLike>();

    response.status(500).json({
      success: false,
      error: {
        code: exception.code,
        message: exception.message,
        ...(exception.context && { context: exception.context })
      }
    });
  }
}
