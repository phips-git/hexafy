import {
  ConsoleLoggingAdapter,
  NoOpMetricsAdapter,
  SystemClockAdapter
} from '../infrastructure/adapters';
import type { ClockPort, LoggingPort, MetricsPort } from './ports';

/** Configuration for service base. */
export interface ServiceConfiguration {
  /**
   * Optional clock port for time-based business logic. If not provided, the
   * system clock is used by default. Inject a custom implementation for
   * deterministic testing.
   */
  clock?: ClockPort;
  /**
   * Optional logging instance. If not provided, ConsoleLoggingAdapter is used
   * by default for developer convenience. Pass NoOpLoggingAdapter to explicitly
   * disable logging.
   */
  logging?: LoggingPort;
  /**
   * Optional metrics port for observability. If not provided,
   * NoOpMetricsAdapter is used (no metrics recorded). Pass a custom
   * implementation to enable metrics collection.
   */
  metrics?: MetricsPort;
}

/**
 * Base class for application services.
 *
 * A lightweight implementation strategy for inbound ports (application entry
 * points) and shared application-layer components. Provides dependency
 * injection for infrastructure ports without owning an operation lifecycle.
 *
 * Use ServiceBase for:
 *
 * - Shared business logic composed by multiple use cases
 * - Lightweight entry points that don't need execution tracking (scheduled jobs,
 *   event handlers, CLI commands)
 * - Stateful components that maintain data between calls
 *
 * Use `Usecase` instead when you need:
 *
 * - Execution IDs and duration tracking
 * - Cancellation support
 * - Automatic wrapping of the outcome in a `UsecaseResult`
 *
 * `Usecase` extends this class, adding an operation lifecycle on top of the
 * same injected ports — the two strategies differ in lifecycle, not in kind.
 *
 * Unlike `Usecase`, a service does not track executions, log completion
 * automatically, or wrap results. Services log and record metrics through the
 * injected ports when they choose to.
 *
 * @example
 *   ```typescript
 *   class EmailService extends ServiceBase {
 *     constructor(
 *       private readonly emailRepository: EmailRepository,
 *       options: ServiceConfiguration = {}
 *     ) {
 *       super(options);
 *     }
 *
 *     async sendWelcomeEmail(userId: string): Promise<void> {
 *       const email = await this.buildWelcomeEmail(userId);
 *       await this.emailRepository.send(email);
 *     }
 *   }
 *   ```;
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
