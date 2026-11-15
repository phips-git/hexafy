import type { LoggingPort } from '@hexafy/core/application';

/** Severity levels supported by observability helpers. */
export type LogLevel = 'info' | 'warn' | 'error';

/** Optional error shape carrying a preferred log level. */
export interface LogLevelAwareError {
  logLevel?: LogLevel;
}

const isLogLevel = (value: unknown): value is LogLevel =>
  value === 'info' || value === 'warn' || value === 'error';

/**
 * Resolves a log severity from an unknown error value.
 *
 * Priority:
 *
 * 1. Explicit `error.logLevel` when valid
 * 2. Message-based transient/infrastructure heuristics (`warn`)
 * 3. Fallback (`error`)
 */
export const resolveLogLevelFromError = (error: unknown): LogLevel => {
  if (typeof error === 'object' && error !== null) {
    const candidate = error as { logLevel?: unknown };
    if (isLogLevel(candidate.logLevel)) {
      return candidate.logLevel;
    }
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (
      /timeout|temporar|rate limit|429|503|502|504|network|fetch failed|econnreset|econnrefused|etimedout|socket hang up/i.test(
        message
      )
    ) {
      return 'warn';
    }
  }

  return 'error';
};

/**
 * Adapter that adds helper methods for log-level-aware error logging while
 * still satisfying the plain {@link LoggingPort} contract.
 */
export class DomainErrorLevelLoggerAdapter implements LoggingPort {
  constructor(
    private readonly delegate: LoggingPort,
    private readonly resolver: (
      error: unknown
    ) => LogLevel = resolveLogLevelFromError
  ) {}

  info(message: string, data?: unknown): void {
    this.delegate.info(message, data);
  }

  debug(message: string, data?: unknown): void {
    this.delegate.debug(message, data);
  }

  warn(message: string, data?: unknown): void {
    this.delegate.warn(message, data);
  }

  error(message: string, data?: unknown): void {
    this.delegate.error(message, data);
  }

  /** Writes with an explicit level. */
  log(level: LogLevel, message: string, data?: unknown): void {
    switch (level) {
      case 'warn':
        this.warn(message, data);
        break;
      case 'error':
        this.error(message, data);
        break;
      case 'info':
      default:
        this.info(message, data);
        break;
    }
  }

  /** Resolves level from error and logs once with that severity. */
  fromError(error: unknown, message: string, data?: unknown): void {
    this.log(this.resolver(error), message, data);
  }
}
