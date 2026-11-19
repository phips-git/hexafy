/** Error codes for application and domain errors. */
export const ErrorCodes = {
  APPLICATION_ERROR: 'APPLICATION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  CONFLICT_ERROR: 'CONFLICT_ERROR',
  UNAUTHORIZED_ERROR: 'UNAUTHORIZED_ERROR',
  FORBIDDEN_ERROR: 'FORBIDDEN_ERROR',
  INVARIANT_ERROR: 'INVARIANT_ERROR',
  INFRASTRUCTURE_ERROR: 'INFRASTRUCTURE_ERROR'
} as const;

export type ErrorCodes = (typeof ErrorCodes)[keyof typeof ErrorCodes];

/** Error metadata used by application and domain errors. */
export interface ApplicationErrorOptions {
  /** Machine-readable error code. Defaults are provided per error type. */
  code?: string;
  /** Structured debugging context. */
  context?: Record<string, unknown>;
  /** Underlying cause. */
  cause?: unknown;
}

/** Base error for application and domain boundaries. */
export class ApplicationError extends Error {
  readonly code: string;
  readonly context: Record<string, unknown> | undefined;

  /** Creates a new application error. */
  constructor(message: string, options: ApplicationErrorOptions = {}) {
    super(message, { cause: options.cause });
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = new.target.name;
    this.code = options.code ?? ErrorCodes.APPLICATION_ERROR;
    this.context = options.context;
  }
}

/** Error raised for invalid input or failed validation rules. */
export class ValidationError extends ApplicationError {
  constructor(
    message = 'Validation failed',
    options?: ApplicationErrorOptions
  ) {
    super(message, {
      ...options,
      code: options?.code ?? ErrorCodes.VALIDATION_ERROR
    });
  }
}

/** Error raised when a required resource is missing. */
export class NotFoundError extends ApplicationError {
  constructor(
    message = 'Resource not found',
    options?: ApplicationErrorOptions
  ) {
    super(message, {
      ...options,
      code: options?.code ?? ErrorCodes.NOT_FOUND_ERROR
    });
  }
}

/** Error raised for conflicting domain or persistence state. */
export class ConflictError extends ApplicationError {
  constructor(
    message = 'Conflict detected',
    options?: ApplicationErrorOptions
  ) {
    super(message, {
      ...options,
      code: options?.code ?? ErrorCodes.CONFLICT_ERROR
    });
  }
}

/** Error raised when authentication is missing or invalid. */
export class UnauthorizedError extends ApplicationError {
  constructor(message = 'Unauthorized', options?: ApplicationErrorOptions) {
    super(message, {
      ...options,
      code: options?.code ?? ErrorCodes.UNAUTHORIZED_ERROR
    });
  }
}

/** Error raised when the caller lacks permission. */
export class ForbiddenError extends ApplicationError {
  constructor(message = 'Forbidden', options?: ApplicationErrorOptions) {
    super(message, {
      ...options,
      code: options?.code ?? ErrorCodes.FORBIDDEN_ERROR
    });
  }
}

/** Error raised when domain invariants are broken. */
export class InvariantError extends ApplicationError {
  constructor(
    message = 'Invariant violated',
    options?: ApplicationErrorOptions
  ) {
    super(message, {
      ...options,
      code: options?.code ?? ErrorCodes.INVARIANT_ERROR
    });
  }
}

/** Error raised for external dependency or infrastructure failures. */
export class InfrastructureError extends ApplicationError {
  constructor(
    message = 'Infrastructure failure',
    options?: ApplicationErrorOptions
  ) {
    super(message, {
      ...options,
      code: options?.code ?? ErrorCodes.INFRASTRUCTURE_ERROR
    });
  }
}
