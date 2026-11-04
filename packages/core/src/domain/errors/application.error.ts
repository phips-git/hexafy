/**
 * Options for configuring application errors.
 *
 * @param code - An optional error code for programmatic handling
 * @param context - Optional structured context data for debugging
 * @param cause - Optional underlying cause for error chaining
 */
export interface ApplicationErrorOptions {
  code?: string;
  context?: Record<string, unknown>;
  cause?: unknown;
}

/**
 * Details extracted from error configuration.
 *
 * Represents either structured error options (context, cause) or a raw error
 * value.
 */
export type ApplicationErrorDetails =
  Omit<ApplicationErrorOptions, 'code'> | unknown;

/**
 * Base error class for application/domain boundaries.
 *
 * Provides standardized error handling with error codes and context. Consumers
 * may use this class or provide their own errors with a compatible shape.
 *
 * @example
 *   ```typescript
 *   // With custom code
 *   throw new ApplicationError('Invalid operation', { code: 'INVALID_OP' });
 *
 *   // With context
 *   throw new ApplicationError('Payment failed', {
 *     code: 'PAYMENT_ERROR',
 *     context: { amount: 100, currency: 'USD' }
 *   });
 *
 *   // With cause (error chaining)
 *   try {
 *     await someOperation();
 *   } catch (e) {
 *     throw new ApplicationError('Operation failed', { cause: e });
 *   }
 *   ```;
 *
 * @param message - The error message
 * @param options - Optional error configuration
 */
export class ApplicationError extends Error {
  readonly code: string;
  readonly context: Record<string, unknown> | undefined;

  /**
   * Constructs a new ApplicationError.
   *
   * @param message - The error message
   * @param options - Optional error configuration (code, context, cause)
   */
  constructor(message: string, options: ApplicationErrorOptions = {}) {
    super(message, { cause: options.cause });
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = new.target.name;
    this.code = options.code ?? 'APPLICATION_ERROR';
    this.context = options.context;
  }
}

/**
 * Validation error for input validation failures.
 *
 * @example
 *   ```typescript
 *   // Simple validation error
 *   throw new ValidationError('Email is required');
 *
 *   // With validation details
 *   throw new ValidationError('Validation failed', {
 *     context: {
 *       field: 'email',
 *       reason: 'Invalid email format'
 *     }
 *   });
 *   ```;
 *
 * @param message - Optional error message (default: 'Validation failed')
 * @param details - Optional validation details or raw value
 */
export class ValidationError extends ApplicationError {
  constructor(
    message = 'Validation failed',
    details?: ApplicationErrorDetails
  ) {
    const options = normalizeApplicationErrorDetails(details);
    super(message, { ...options, code: 'VALIDATION_ERROR' });
  }
}

/**
 * Not found error for missing resources.
 *
 * @example
 *   ```typescript
 *   // Standard message
 *   throw new NotFoundError('User');
 *   // → "User not found"
 *
 *   // Custom message
 *   throw new NotFoundError('The specified order was not found');
 *   ```;
 *
 * @param resourceOrMessage - Resource name or custom error message
 * @param details - Optional error details
 */
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

/**
 * Conflict error for resource conflicts (e.g., duplicate entries).
 *
 * @example
 *   ```typescript
 *   throw new ConflictError('Email already registered');
 *   ```;
 *
 * @param message - Optional error message (default: 'Conflict detected')
 * @param details - Optional error details
 */
export class ConflictError extends ApplicationError {
  constructor(
    message = 'Conflict detected',
    details?: ApplicationErrorDetails
  ) {
    const options = normalizeApplicationErrorDetails(details);
    super(message, { ...options, code: 'CONFLICT_ERROR' });
  }
}

/**
 * Unauthorized error for authentication failures.
 *
 * @example
 *   ```typescript
 *   throw new UnauthorizedError('Invalid authentication token');
 *   ```;
 *
 * @param message - Optional error message (default: 'Unauthorized')
 * @param details - Optional error details
 */
export class UnauthorizedError extends ApplicationError {
  constructor(message = 'Unauthorized', details?: ApplicationErrorDetails) {
    const options = normalizeApplicationErrorDetails(details);
    super(message, { ...options, code: 'UNAUTHORIZED_ERROR' });
  }
}

/**
 * Forbidden error for authorization failures.
 *
 * @example
 *   ```typescript
 *   throw new ForbiddenError('Insufficient permissions');
 *   ```;
 *
 * @param message - Optional error message (default: 'Forbidden')
 * @param details - Optional error details
 */
export class ForbiddenError extends ApplicationError {
  constructor(message = 'Forbidden', details?: ApplicationErrorDetails) {
    const options = normalizeApplicationErrorDetails(details);
    super(message, { ...options, code: 'FORBIDDEN_ERROR' });
  }
}

/**
 * Invariant error for violated business invariants.
 *
 * @example
 *   ```typescript
 *   throw new InvariantError('Order cannot be modified after shipment');
 *   ```;
 *
 * @param message - Optional error message (default: 'Invariant violated')
 * @param details - Optional error details
 */
export class InvariantError extends ApplicationError {
  constructor(
    message = 'Invariant violated',
    details?: ApplicationErrorDetails
  ) {
    const options = normalizeApplicationErrorDetails(details);
    super(message, { ...options, code: 'INVARIANT_ERROR' });
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
