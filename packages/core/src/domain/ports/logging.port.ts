/**
 * Port for structured logging operations.
 *
 * Provides a unified interface for logging across different layers.
 * Implementations can be console-based, file-based, or distributed (e.g.,
 * logging to a service).
 *
 * @example
 *   ```typescript
 *   logger.info('User created', { userId: '123', email: 'user@example.com' });
 *   logger.debug('Processing payment', { amount: 100 });
 *   logger.warn('Rate limit approaching', { remaining: 10 });
 *   logger.error('Payment failed', { error: 'timeout', attempt: 3 });
 *   ```
 *
 * @param message - The log message
 * @param data - Optional structured data to include in the log
 */
export interface LoggingPort {
  info(message: string, data?: unknown): void;
  debug(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
}
