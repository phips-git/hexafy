/** Global exception filter for application errors */
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch } from '@nestjs/common';

import {
  ApplicationError,
  ExternalServiceError,
  HttpForbiddenError,
  HttpUnauthorizedError,
  InfrastructureError,
  InternalServerError
} from '../domain/errors';

/** Global exception filter for HTTP-specific errors */
@Catch(HttpUnauthorizedError, HttpForbiddenError)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(
    exception: HttpUnauthorizedError | HttpForbiddenError,
    host: ArgumentsHost
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<any>();

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

/** Global exception filter for domain/application errors */
@Catch(ApplicationError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: ApplicationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<any>();

    response.status(400).json({
      success: false,
      error: {
        code: exception.code,
        message: exception.message,
        ...(exception.context && { context: exception.context })
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
    const response = ctx.getResponse<any>();

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
