import {
  ConsoleLoggingAdapter,
  NoOpMetricsAdapter,
  SystemClockAdapter
} from '../infrastructure/adapters';
import type { ClockPort, LoggingPort, MetricsPort } from './ports';

/** Configuration for `ServiceBase`. */
export interface ServiceConfiguration {
  /** Clock implementation. Defaults to the system clock. */
  clock?: ClockPort;
  /** Logger implementation. Defaults to the console logger. */
  logging?: LoggingPort;
  /** Metrics implementation. Defaults to a no-op adapter. */
  metrics?: MetricsPort;
}

/**
 * Base class for application services.
 *
 * Use this for logic that needs shared infrastructure ports without the
 * use-case execution lifecycle.
 */
export abstract class ServiceBase {
  protected readonly clock: ClockPort;
  protected readonly logger: LoggingPort;
  protected readonly metrics: MetricsPort;

  constructor(options: ServiceConfiguration = {}) {
    this.clock = options.clock ?? SystemClockAdapter;
    this.logger = options.logging ?? ConsoleLoggingAdapter;
    this.metrics = options.metrics ?? NoOpMetricsAdapter;
  }
}
