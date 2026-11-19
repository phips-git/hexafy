import {
  ConsoleLoggingAdapter,
  NoOpMetricsAdapter,
  SystemClockAdapter
} from '../infrastructure/adapters';
import type { ClockPort, LoggingPort, MetricsPort } from './ports';

/** Configuration for `ServiceBase`. */
export interface ServiceConfiguration {
  /** Clock implementation. Defaults to the system clock. */
  readonly clock?: ClockPort | undefined;
  /** Logger implementation. Defaults to the console logger. */
  readonly logger?: LoggingPort | undefined;
  /** Metrics implementation. Defaults to a no-op adapter. */
  readonly metrics?: MetricsPort | undefined;
}

/**
 * Base class for application services.
 *
 * Use this for logic that needs shared infrastructure ports without the use
 * case execution lifecycle. Subclasses can leverage injected ports for
 * time-based operations, logging, and metrics.
 */
export abstract class ServiceBase {
  protected readonly clock: ClockPort;
  protected readonly logger: LoggingPort;
  protected readonly metrics: MetricsPort;

  constructor(configuration: ServiceConfiguration = {}) {
    this.clock = configuration.clock ?? SystemClockAdapter;
    this.logger = configuration.logger ?? ConsoleLoggingAdapter;
    this.metrics = configuration.metrics ?? NoOpMetricsAdapter;
  }
}
