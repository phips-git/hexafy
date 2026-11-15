/**
 * Port for structured logging.
 *
 * Implementations may write to a console, a file, or a remote log sink.
 */
export interface LoggingPort {
  info(message: string, data?: unknown): void;
  debug(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
}
