import { LoggingPort } from '../../../domain/ports';

export const NoOpLoggingAdapter: LoggingPort = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {}
};
