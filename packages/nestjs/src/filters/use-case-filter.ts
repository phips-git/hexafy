/**
 * Exception filter for Application errors
 *
 * Converts application errors to HTTP responses
 */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus
} from '@nestjs/common';

import { ApplicationError } from '../domain/errors';

/** Global exception filter for use case errors */
@Catch(ApplicationError)
export class UseCaseFilter implements ExceptionFilter {
  catch(exception: ApplicationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<any>();
    const request = ctx.getRequest<any>();

    response.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      error: exception.message
    });
  }
}
