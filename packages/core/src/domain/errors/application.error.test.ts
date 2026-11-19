import { describe, expect, it } from 'bun:test';

import {
  ApplicationError,
  ConflictError,
  ErrorCodes,
  ForbiddenError,
  InfrastructureError,
  InvariantError,
  NotFoundError,
  UnauthorizedError,
  ValidationError
} from './application.error';

describe('application.error', () => {
  it('creates ApplicationError with defaults', () => {
    const error = new ApplicationError('message');
    expect(error.name).toBe('ApplicationError');
    expect(error.code).toBe('APPLICATION_ERROR');
    expect(error.context).toBeUndefined();
  });

  it('keeps custom code/context/cause', () => {
    const cause = new Error('root');
    const error = new ApplicationError('message', {
      code: ErrorCodes.UNAUTHORIZED_ERROR,
      context: { op: 'test' },
      cause
    });

    expect(error.code).toBe(ErrorCodes.UNAUTHORIZED_ERROR);
    expect(error.context).toEqual({ op: 'test' });
    expect(error.cause).toBe(cause);
  });

  it('accepts structured options', () => {
    const error = new ValidationError('invalid', {
      context: { field: 'email' },
      cause: new Error('validation failed')
    });

    expect(error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    expect(error.context).toEqual({ field: 'email' });
    expect(error.cause).toBeInstanceOf(Error);
  });

  it('uses default NotFoundError message', () => {
    expect(new NotFoundError().message).toBe('Resource not found');
  });

  it('assigns dedicated codes for specific error classes', () => {
    expect(new ConflictError().code).toBe(ErrorCodes.CONFLICT_ERROR);
    expect(new UnauthorizedError().code).toBe(ErrorCodes.UNAUTHORIZED_ERROR);
    expect(new ForbiddenError().code).toBe(ErrorCodes.FORBIDDEN_ERROR);
    expect(new InvariantError().code).toBe(ErrorCodes.INVARIANT_ERROR);
    expect(new InfrastructureError().code).toBe(
      ErrorCodes.INFRASTRUCTURE_ERROR
    );
  });

  it('allows custom error codes on ApplicationError', () => {
    const error = new ApplicationError('custom', {
      code: 'CUSTOM_CODE'
    });
    expect(error.code).toBe('CUSTOM_CODE');
  });

  it('allows subclasses to override error codes', () => {
    const error = new ValidationError('invalid', {
      code: 'CUSTOM_VALIDATION'
    });
    expect(error.code).toBe('CUSTOM_VALIDATION');
  });

  it('uses default codes when not overridden', () => {
    expect(new ValidationError().code).toBe(ErrorCodes.VALIDATION_ERROR);
    expect(new NotFoundError().code).toBe(ErrorCodes.NOT_FOUND_ERROR);
    expect(new ConflictError().code).toBe(ErrorCodes.CONFLICT_ERROR);
  });
});
