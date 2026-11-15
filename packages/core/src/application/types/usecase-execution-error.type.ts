/**
 * Error raised when a use case execution is cancelled via AbortSignal.
 *
 * This is returned by `Usecase.execute()` when the provided `signal` is already
 * aborted, or when a timeout fires before the user-provided signal.
 */
export class UsecaseCancelledError extends Error {
  override readonly cause?: unknown;

  constructor(message: string, cause?: Error | undefined) {
    super(message, cause && { cause });
    this.name = this.constructor.name;
    this.cause = cause;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Error raised when a use case execution exceeds its configured timeout.
 *
 * This is returned by `Usecase.execute()` when `timeoutMs` is configured and
 * the execution takes longer than the specified duration.
 */
export class UsecaseTimeoutError extends Error {
  override readonly cause?: unknown;

  constructor(message: string, cause?: Error | undefined) {
    super(message, cause && { cause });
    this.name = this.constructor.name;
    this.cause = cause;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
