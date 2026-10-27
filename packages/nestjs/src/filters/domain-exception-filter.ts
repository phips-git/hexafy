/**
 * Exception filter for DomainErrors
 *
 * Converts domain errors to HTTP 400 responses
 */
import { DomainError } from '@hex/core';
import {
    ArgumentsHost,
    Catch,
    ExceptionFilter
} from '@nestjs/common';

/**
 * Global exception filter for domain errors
 */
@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<any>();
    const request = ctx.getRequest<any>();

    response.status(400).json({
      success: false,
      error: exception.message,
      code: exception.code,
    });
  }
}
