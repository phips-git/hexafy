/** Options for configuring application errors. */
export interface ApplicationErrorOptions {
  code?: string;
  context?: Record<string, unknown>;
  cause?: unknown;
}

/** Details extracted from error configuration. */
export type ApplicationErrorDetails = ApplicationErrorOptions | unknown;

/**
 * Base class for application errors. Consumers can extend this for
 * domain-specific error handling.
 */
export class ApplicationError extends Error {
  readonly code: string;
  readonly context: Record<string, unknown> | undefined;

  constructor(
    message: string,
    options: { code?: string; context?: Record<string, unknown> } = {}
  ) {
    super(message);
    this.name = 'ApplicationError';
    this.code = options.code ?? 'APPLICATION_ERROR';
    this.context = options.context;
  }
}

/**
 * Infrastructure error for external system failures.
 *
 * @example
 *   ```typescript
 *   try {
 *     await database.query();
 *   } catch (e) {
 *     throw new InfrastructureError('Database operation failed', e);
 *   }
 *   ```;
 *
 * @param message - Optional error message (default: 'Infrastructure failure')
 * @param details - Optional error details or cause
 */
export class InfrastructureError extends ApplicationError {
  constructor(
    message = 'Infrastructure failure',
    details?: ApplicationErrorDetails
  ) {
    const options = normalizeApplicationErrorDetails(details);
    super(message, { ...options, code: 'INFRASTRUCTURE_ERROR' });
  }
}

/**
 * External service error for third-party API failures.
 *
 * @example
 *   ```typescript
 *   throw new ExternalServiceError('Payment gateway unavailable');
 *   ```;
 *
 * @param message - Optional error message (default: 'External service failure')
 * @param details - Optional error details
 */
export class ExternalServiceError extends ApplicationError {
  constructor(
    message = 'External service failure',
    details?: ApplicationErrorDetails
  ) {
    const options = normalizeApplicationErrorDetails(details);
    super(message, { ...options, code: 'EXTERNAL_SERVICE_ERROR' });
  }
}

/**
 * Internal server error for unexpected system failures.
 *
 * @example
 *   ```typescript
 *   throw new InternalServerError(
 *     'Unexpected null reference in order processing'
 *   );
 *   ```;
 *
 * @param message - Optional error message (default: 'Internal server error')
 * @param details - Optional error details
 */
export class InternalServerError extends ApplicationError {
  constructor(
    message = 'Internal server error',
    details?: ApplicationErrorDetails
  ) {
    const options = normalizeApplicationErrorDetails(details);
    super(message, { ...options, code: 'INTERNAL_SERVER_ERROR' });
  }
}

/**
 * HTTP Unauthorized error for authentication failures.
 *
 * @example
 *   ```typescript
 *   throw new HttpUnauthorizedError('Invalid authentication token');
 *   ```;
 *
 * @param message - Optional error message (default: 'Unauthorized')
 * @param details - Optional error details
 */
export class HttpUnauthorizedError extends ApplicationError {
  constructor(message = 'Unauthorized', details?: ApplicationErrorDetails) {
    const options = normalizeApplicationErrorDetails(details);
    super(message, { ...options, code: 'HTTP_UNAUTHORIZED_ERROR' });
    this.name = 'HttpUnauthorizedError';
  }
}

/**
 * HTTP Forbidden error for authorization failures.
 *
 * @example
 *   ```typescript
 *   throw new HttpForbiddenError('Insufficient permissions');
 *   ```;
 *
 * @param message - Optional error message (default: 'Forbidden')
 * @param details - Optional error details
 */
export class HttpForbiddenError extends ApplicationError {
  constructor(message = 'Forbidden', details?: ApplicationErrorDetails) {
    const options = normalizeApplicationErrorDetails(details);
    super(message, { ...options, code: 'HTTP_FORBIDDEN_ERROR' });
    this.name = 'HttpForbiddenError';
  }
}

export class ValidationError extends ApplicationError {
  constructor(
    message = 'Validation failed',
    details?: ApplicationErrorDetails
  ) {
    const options = normalizeApplicationErrorDetails(details);
    super(message, { ...options, code: 'VALIDATION_ERROR' });
    this.name = 'ValidationError';
  }
}

/**
 * Conflict error for resource conflicts (e.g., duplicate entries).
 *
 * @example
 *   ```typescript
 *   throw new ConflictError('Email already registered');
 *   ```;
 *
 * @param message - Optional error message (default: 'Conflict')
 * @param details - Optional error details
 */
export class ConflictError extends ApplicationError {
  constructor(message = 'Conflict', details?: ApplicationErrorDetails) {
    const options = normalizeApplicationErrorDetails(details);
    super(message, { ...options, code: 'CONFLICT_ERROR' });
    this.name = 'ConflictError';
  }
}

/**
 * Not found error for missing resources.
 *
 * @example
 *   ```typescript
 *   throw new NotFoundError('User not found');
 *   ```;
 *
 * @param message - Optional error message (default: 'Not found')
 * @param details - Optional error details
 */
export class NotFoundError extends ApplicationError {
  constructor(message = 'Not found', details?: ApplicationErrorDetails) {
    const options = normalizeApplicationErrorDetails(details);
    super(message, { ...options, code: 'NOT_FOUND_ERROR' });
    this.name = 'NotFoundError';
  }
}

function normalizeApplicationErrorDetails(
  details: ApplicationErrorDetails | undefined
): { context?: Record<string, unknown>; cause?: unknown } {
  if (details === undefined) {
    return {};
  }

  if (
    details !== null &&
    typeof details === 'object' &&
    ('context' in details || 'cause' in details)
  ) {
    return details as { context?: Record<string, unknown>; cause?: unknown };
  }

  return { cause: details };
}
