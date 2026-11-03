import type { LoggingPort } from '../../../domain/ports';

/**
 * No-op logging adapter implementing LoggingPort.
 *
 * Discards all log messages. Useful for:
 *
 * - Production environments with external logging
 * - Testing where logging output is undesirable
 * - Performance-critical paths without logging
 *
 * @see {@link LoggingPort}
 */
export const NoOpLoggingAdapter: LoggingPort = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {}
};
