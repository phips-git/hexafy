import { getDomainErrorCode, isDomainError } from '@hexafy/core/domain';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { Response } from 'express';

export interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  timestamp: string;
  path: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'object'
          ? exceptionResponse['message'] || exceptionResponse
          : exceptionResponse;
    } else if (isDomainError(exception)) {
      status = this.getStatusForDomainError(exception);
      message = exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url
    } satisfies ErrorResponse);
  }

  private getStatusForDomainError(exception: Error): number {
    switch (getDomainErrorCode(exception)) {
      case 'UNAUTHORIZED_ERROR':
        return HttpStatus.UNAUTHORIZED;
      case 'FORBIDDEN_ERROR':
        return HttpStatus.FORBIDDEN;
      case 'NOT_FOUND_ERROR':
        return HttpStatus.NOT_FOUND;
      case 'VALIDATION_ERROR':
        return HttpStatus.BAD_REQUEST;
      case 'CONFLICT_ERROR':
        return HttpStatus.CONFLICT;
      case 'INTERNAL_SERVER_ERROR':
      case 'INVARIANT_ERROR':
      case 'INFRASTRUCTURE_ERROR':
        return HttpStatus.INTERNAL_SERVER_ERROR;
      case 'EXTERNAL_SERVICE_ERROR':
        return HttpStatus.BAD_GATEWAY;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
