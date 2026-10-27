/**
 * Logger interface for cross-cutting concerns
 *
 * Any object implementing this interface can be used as a logger
 * with @hex/core use cases.
 */
export interface Logger {
  /**
   * Log an info message
   * @param message - The log message
   * @param data - Additional data to include
   */
  info(message: string, data?: unknown): void;

  /**
   * Log a warning
   * @param message - The warning message
   * @param data - Additional data to include
   */
  warn(message: string, data?: unknown): void;

  /**
   * Log an error
   * @param message - The error message
   * @param data - Additional data to include
   */
  error(message: string, data?: unknown): void;

  /**
   * Log a debug message
   * @param message - The debug message
   * @param data - Additional data to include
   */
  debug(message: string, data?: unknown): void;
}

/**
 * Log context data for structured logging
 */
export interface LogContext {
  /** Unique execution identifier */
  executionId?: string;
  /** Execution duration in milliseconds */
  durationMs?: number;
  /** Additional context data */
  [key: string]: unknown;
  /** Error object (if applicable) */
  error?: Error;
  /** Error context */
  errorContext?: unknown;
}

/**
 * Default console logger that implements the Logger interface
 * Provides structured JSON output for better log aggregation
 */
export const consoleLogger: Logger = {
  info(message: string, data?: unknown): void {
    if (data === undefined || data === null) {
      console.log(JSON.stringify({ level: 'info', message }));
    } else {
      console.log(JSON.stringify({ level: 'info', message, ...data }));
    }
  },

  warn(message: string, data?: unknown): void {
    if (data === undefined || data === null) {
      console.warn(JSON.stringify({ level: 'warn', message }));
    } else {
      console.warn(JSON.stringify({ level: 'warn', message, ...data }));
    }
  },

  error(message: string, data?: unknown): void {
    if (data === undefined || data === null) {
      console.error(JSON.stringify({ level: 'error', message }));
    } else {
      console.error(JSON.stringify({ level: 'error', message, ...data }));
    }
  },

  debug(message: string, data?: unknown): void {
    if (data === undefined || data === null) {
      console.debug(JSON.stringify({ level: 'debug', message }));
    } else {
      console.debug(JSON.stringify({ level: 'debug', message, ...data }));
    }
  }
};
