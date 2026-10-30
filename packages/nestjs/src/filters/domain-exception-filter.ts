/** Global exception filter for application errors */
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

import { ApplicationError } from '../domain/errors';
@Catch(ApplicationError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: ApplicationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<any>();
    const request = ctx.getRequest<any>();

    response.status(400).json({
      success: false,
      error: exception.message
    });
  }
}
