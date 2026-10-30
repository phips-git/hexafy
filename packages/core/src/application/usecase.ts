import {
  ClockPort,
  IdentifierPort,
  LoggingPort,
  MetricsPort
} from '../domain/ports';
import { UniqueIdentifier } from '../domain/types';
import { SystemClockAdapter } from '../infrastructure/adapters/clock';
import { SystemIdentifierAdapter } from '../infrastructure/adapters/identifier';
import { ConsoleLoggingAdapter } from '../infrastructure/adapters/logging';
import { NoOpMetricsAdapter } from '../infrastructure/adapters/metrics';
import { CancellationToken, UsecaseResult } from './types';
import { failure, success } from './utils';

/** Configuration for use case execution. */
export interface UsecaseExecutionConfiguration {
  clock?: ClockPort;
  /**
   * Optional logging instance. If not provided, consoleLogger is used by
   * default for developer convenience. Set to NOOP_LOGGER to explicitly disable
   * logging.
   */
  logging?: LoggingPort;
  /**
   * Optional metrics port for observability. If not provided, NOOP_METRICS is
   * used (no metrics recorded). Pass a custom implementation to enable metrics
   * collection.
   */
  metrics?: MetricsPort;
  identifier?: IdentifierPort;
}

/**
 * Abstract base class for all use cases.
 *
 * Provides structured logging, execution IDs, and duration tracking.
 *
 * Simple semantics:
 *
 * - Return a value → success (wrapped automatically)
 * - Throw an error → failure (wrapped automatically)
 *
 * Logging is enabled by default (uses console logger) for developer
 * convenience. To disable logging, explicitly pass NOOP_LOGGER.
 *
 * The framework logs the fact of failure, not the error details. Consumers
 * handle error logging at the call site by inspecting the Result type.
 *
 * @example
 *   ```typescript
 *   // Default: uses consoleLogger (logs to console)
 *   const useCase = new CreateUserUseCase({});
 *   await useCase.execute({ email: 'user@example.com' });
 *   // → Logs to console
 *
 *   // Disable logging (for tests or silent mode)
 *   const silentUseCase = new CreateUserUseCase({
 *     logger: NOOP_LOGGER
 *   });
 *   await silentUseCase.execute({ email: 'user@example.com' });
 *   // → No output
 *
 *   // Custom logger
 *   const useCase = new CreateUserUseCase({
 *     logger: myCustomLogger
 *   });
 *   ```;
 *
 * @template TInput - The input type for the use case
 * @template TOutput - The output type for the use case
 */
export abstract class Usecase<TInput = void, TOutput = void> {
  constructor(
    protected readonly dependencies: UsecaseExecutionConfiguration = {}
  ) {}

  /**
   * Abstract method to implement.
   *
   * Simple semantics:
   *
   * - Return a value → success (wrapped automatically)
   * - Throw an error → failure (wrapped automatically)
   *
   * Use the logger to log business logic and errors as needed.
   */
  protected abstract executeInternal(
    input: TInput,
    logger: LoggingPort,
    cancellationToken?: CancellationToken
  ): Promise<TOutput>;

  /**
   * Execute the use case.
   *
   * @param input - The input data for the use case
   * @param executionContext - Additional context to include in logs
   * @param cancellationToken - Optional token for requesting cancellation
   * @returns Promise resolving to a Result (success or failure)
   */
  async execute(
    input: TInput,
    executionContext?: Record<string, unknown>,
    cancellationToken?: CancellationToken
  ): Promise<UsecaseResult<TOutput, Error>> {
    const startTime = this.getNow();
    const executionId = this.getExecutionId();
    const baseContext = { executionId, ...(executionContext ?? {}) };
    const logger = this.getOrCreateLoggingAdapter();
    const metrics = this.getOrCreateMetricsAdapter();

    if (cancellationToken?.isCancelled) {
      metrics.increment('usecase_cancelled', {
        executionId: String(executionId)
      });
      return failure(
        new Error(cancellationToken.reason ?? 'Cancellation requested')
      );
    }

    try {
      const result = await this.executeInternal(
        input,
        logger,
        cancellationToken
      );

      const durationMs = this.getNow() - startTime;
      logger.info('Execution completed', { ...baseContext, durationMs });
      metrics.histogram('usecase_duration', durationMs);

      return success(result);
    } catch (error) {
      const durationMs = this.getNow() - startTime;
      logger.error('Execution failed', { ...baseContext, durationMs });
      metrics.increment('usecase_errors', { executionId: String(executionId) });

      return failure(this.normalizeError(error));
    }
  }

  private getNow(): number {
    return this.dependencies.clock?.now() ?? SystemClockAdapter.now();
  }

  private getExecutionId(): UniqueIdentifier {
    return (
      this.dependencies.identifier?.generate(this.getNowAdapter()) ??
      SystemIdentifierAdapter.generate(this.getNowAdapter())
    );
  }

  private getNowAdapter(): ClockPort {
    return this.dependencies.clock ?? SystemClockAdapter;
  }

  private getOrCreateLoggingAdapter(): LoggingPort {
    return this.dependencies.logging ?? ConsoleLoggingAdapter;
  }

  private getOrCreateMetricsAdapter(): MetricsPort {
    return this.dependencies.metrics ?? NoOpMetricsAdapter;
  }

  private normalizeError(error: unknown): Error {
    return error instanceof Error ? error : new Error(String(error));
  }
}
