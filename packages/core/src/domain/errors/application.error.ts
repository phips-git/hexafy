export interface ApplicationErrorOptions {
  code?: string;
  context?: Record<string, unknown>;
  cause?: unknown;
}

export type ApplicationErrorDetails =
  Omit<ApplicationErrorOptions, 'code'> | unknown;

/**
 * Neutral base error for application/domain boundaries. Consumers may use this
 * class or provide their own errors with a compatible shape.
 */
export class ApplicationError extends Error {
  readonly code: string;
  readonly context?: Record<string, unknown>;

  constructor(message: string, options: ApplicationErrorOptions = {}) {
    super(message, { cause: options.cause });
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = new.target.name;
    this.code = options.code ?? 'APPLICATION_ERROR';
    this.context = options.context;
  }
}

export class ValidationError extends ApplicationError {
  constructor(
    message = 'Validation failed',
    details?: ApplicationErrorDetails
  ) {
    const options = normalizeApplicationErrorDetails(details);
    super(message, { ...options, code: 'VALIDATION_ERROR' });
  }
}

export class NotFoundError extends ApplicationError {
  constructor(
    resourceOrMessage = 'Resource',
    details?: ApplicationErrorDetails
  ) {
    const options = normalizeApplicationErrorDetails(details);
    const message = toNotFoundMessage(resourceOrMessage);
    super(message, { ...options, code: 'NOT_FOUND_ERROR' });
  }
}

export class ConflictError extends ApplicationError {
  constructor(
    message = 'Conflict detected',
    details?: ApplicationErrorDetails
  ) {
    const options = normalizeApplicationErrorDetails(details);
    super(message, { ...options, code: 'CONFLICT_ERROR' });
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor(message = 'Unauthorized', details?: ApplicationErrorDetails) {
    const options = normalizeApplicationErrorDetails(details);
    super(message, { ...options, code: 'UNAUTHORIZED_ERROR' });
  }
}

export class ForbiddenError extends ApplicationError {
  constructor(message = 'Forbidden', details?: ApplicationErrorDetails) {
    const options = normalizeApplicationErrorDetails(details);
    super(message, { ...options, code: 'FORBIDDEN_ERROR' });
  }
}

export class InvariantError extends ApplicationError {
  constructor(
    message = 'Invariant violated',
    details?: ApplicationErrorDetails
  ) {
    const options = normalizeApplicationErrorDetails(details);
    super(message, { ...options, code: 'INVARIANT_ERROR' });
  }
}

export class InfrastructureError extends ApplicationError {
  constructor(
    message = 'Infrastructure failure',
    details?: ApplicationErrorDetails
  ) {
    const options = normalizeApplicationErrorDetails(details);
    super(message, { ...options, code: 'INFRASTRUCTURE_ERROR' });
  }
}

export class ExternalServiceError extends ApplicationError {
  constructor(
    message = 'External service failure',
    details?: ApplicationErrorDetails
  ) {
    const options = normalizeApplicationErrorDetails(details);
    super(message, { ...options, code: 'EXTERNAL_SERVICE_ERROR' });
  }
}

export class InternalServerError extends ApplicationError {
  constructor(
    message = 'Internal server error',
    details?: ApplicationErrorDetails
  ) {
    const options = normalizeApplicationErrorDetails(details);
    super(message, { ...options, code: 'INTERNAL_SERVER_ERROR' });
  }
}

function normalizeApplicationErrorDetails(
  details: ApplicationErrorDetails | undefined
): Omit<ApplicationErrorOptions, 'code'> {
  if (details === undefined) {
    return {};
  }

  if (
    details !== null &&
    typeof details === 'object' &&
    ('context' in details || 'cause' in details)
  ) {
    return details as Omit<ApplicationErrorOptions, 'code'>;
  }

  return { cause: details };
}

function toNotFoundMessage(resourceOrMessage: string): string {
  if (resourceOrMessage.trim().length === 0) {
    return 'Resource not found';
  }

  if (/not found/i.test(resourceOrMessage)) {
    return resourceOrMessage;
  }

  return `${resourceOrMessage} not found`;
}
