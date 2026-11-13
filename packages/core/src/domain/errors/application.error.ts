/** Error metadata used by application and domain errors. */
export interface ApplicationErrorOptions {
  /** Machine-readable error code. */
  code?: string;
  /** Structured debugging context. */
  context?: Record<string, unknown>;
  /** Underlying cause. */
  cause?: unknown;
}

/** Error details accepted by application/domain error factories. */
export type ApplicationErrorDetails =
  Omit<ApplicationErrorOptions, 'code'> | unknown;

/** Base error for application and domain boundaries. */
export class ApplicationError extends Error {
  readonly code: string;
  readonly context: Record<string, unknown> | undefined;

  /** Creates a new application error. */
  constructor(message: string, options: ApplicationErrorOptions = {}) {
    super(message, { cause: options.cause });
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = new.target.name;
    this.code = options.code ?? 'APPLICATION_ERROR';
    this.context = options.context;
  }
}

/** Error raised for invalid input or failed validation rules. */
export class ValidationError extends ApplicationError {
  constructor(
    message = 'Validation failed',
    details?: ApplicationErrorDetails
  ) {
    const options = normalizeApplicationErrorDetails(details);
    super(message, { ...options, code: 'VALIDATION_ERROR' });
  }
}

/** Error raised when a required resource is missing. */
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

/** Error raised for conflicting domain or persistence state. */
export class ConflictError extends ApplicationError {
  constructor(
    message = 'Conflict detected',
    details?: ApplicationErrorDetails
  ) {
    const options = normalizeApplicationErrorDetails(details);
    super(message, { ...options, code: 'CONFLICT_ERROR' });
  }
}

/** Error raised when authentication is missing or invalid. */
export class UnauthorizedError extends ApplicationError {
  constructor(message = 'Unauthorized', details?: ApplicationErrorDetails) {
    const options = normalizeApplicationErrorDetails(details);
    super(message, { ...options, code: 'UNAUTHORIZED_ERROR' });
  }
}

/** Error raised when the caller lacks permission. */
export class ForbiddenError extends ApplicationError {
  constructor(message = 'Forbidden', details?: ApplicationErrorDetails) {
    const options = normalizeApplicationErrorDetails(details);
    super(message, { ...options, code: 'FORBIDDEN_ERROR' });
  }
}

/** Error raised when domain invariants are broken. */
export class InvariantError extends ApplicationError {
  constructor(
    message = 'Invariant violated',
    details?: ApplicationErrorDetails
  ) {
    const options = normalizeApplicationErrorDetails(details);
    super(message, { ...options, code: 'INVARIANT_ERROR' });
  }
}

/** Error raised for external dependency or infrastructure failures. */
export class InfrastructureError extends ApplicationError {
  constructor(
    message = 'Infrastructure failure',
    details?: ApplicationErrorDetails
  ) {
    const options = normalizeApplicationErrorDetails(details);
    super(message, { ...options, code: 'INFRASTRUCTURE_ERROR' });
  }
}

function normalizeApplicationErrorDetails(
  details: ApplicationErrorDetails | undefined
): Omit<ApplicationErrorOptions, 'code'> {
  if (details === undefined) {
    return {};
  }

  if (isErrorOptions(details)) {
    return details;
  }

  return { cause: details };
}

function isErrorOptions(
  value: unknown
): value is Omit<ApplicationErrorOptions, 'code'> {
  return (
    value !== null &&
    typeof value === 'object' &&
    ('context' in value || 'cause' in value)
  );
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
