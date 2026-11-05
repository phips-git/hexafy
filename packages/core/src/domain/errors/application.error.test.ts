import { describe, expect, it } from 'bun:test';

import {
  ApplicationError,
  ConflictError,
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
      code: 'CUSTOM',
      context: { op: 'test' },
      cause
    });

    expect(error.code).toBe('CUSTOM');
    expect(error.context).toEqual({ op: 'test' });
    expect(error.cause).toBe(cause);
  });

  it('normalizes ValidationError details object and raw cause', () => {
    const withContext = new ValidationError('invalid', {
      context: { field: 'email' }
    });
    const withCause = new ValidationError('invalid', 'raw-cause');

    expect(withContext.code).toBe('VALIDATION_ERROR');
    expect(withContext.context).toEqual({ field: 'email' });
    expect(withCause.cause).toBe('raw-cause');
  });

  it('formats NotFoundError messages correctly', () => {
    expect(new NotFoundError('User').message).toBe('User not found');
    expect(new NotFoundError('already not found').message).toBe(
      'already not found'
    );
    expect(new NotFoundError('   ').message).toBe('Resource not found');
  });

  it('assigns dedicated codes for specific error classes', () => {
    expect(new ConflictError().code).toBe('CONFLICT_ERROR');
    expect(new UnauthorizedError().code).toBe('UNAUTHORIZED_ERROR');
    expect(new ForbiddenError().code).toBe('FORBIDDEN_ERROR');
    expect(new InvariantError().code).toBe('INVARIANT_ERROR');
    expect(new InfrastructureError().code).toBe('INFRASTRUCTURE_ERROR');
  });
});
