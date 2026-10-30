import { LoggingPort } from '../../../domain/ports';

export const ConsoleLoggingAdapter: LoggingPort = {
  info(message: string, data?: unknown): void {
    if (data === undefined || data === null) {
      console.log(message);
    } else {
      console.log(message, data);
    }
  },

  warn(message: string, data?: unknown): void {
    if (data === undefined || data === null) {
      console.warn(message);
    } else {
      console.warn(message, data);
    }
  },

  error(message: string, data?: unknown): void {
    if (data === undefined || data === null) {
      console.error(message);
    } else {
      console.error(message, data);
    }
  },

  debug(message: string, data?: unknown): void {
    if (data === undefined || data === null) {
      console.debug(message);
    } else {
      console.debug(message, data);
    }
  }
};
