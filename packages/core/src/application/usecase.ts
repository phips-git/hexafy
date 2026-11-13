import type { UniqueIdentifier } from '../domain/primitives';
import { SystemIdentifierAdapter } from '../infrastructure/adapters';
import type {
  ClockPort,
  IdentifierPort,
  LoggingPort,
  MetricsPort
} from './ports';
import { ServiceBase } from './service.base';
import type { CancellationToken, UsecaseResult } from './types';
import { failure, success } from './utils';

/** Configuration for use case execution. */
export interface UsecaseExecutionConfiguration {
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
  identifier?: IdentifierPort;
}

/** Alias for UsecaseExecutionConfiguration for backwards compatibility. */
export type UsecaseExecutionDependencies = UsecaseExecutionConfiguration;

/**
 * Abstract base class for all use cases.
 *
 * A `ServiceBase` with a full operation lifecycle on top of the same injected
 * infrastructure ports. Provides structured logging, execution IDs, and
 * duration tracking.
 *
 * Simple semantics:
 *
 * - Return a value → success (wrapped automatically)
 * - Throw an error → failure (wrapped automatically)
 *
 * Logging is enabled by default (uses ConsoleLoggingAdapter) for developer
 * convenience. To disable logging, pass NoOpLoggingAdapter.
 *
 * The framework logs the fact of failure, not the error details. Consumers
 * handle error logging at the call site by inspecting the Result type.
 *
 * @example
 *   ```typescript
 *   import { NoOpLoggingAdapter } from '../infrastructure/adapters';
 *
 *   // Default: logs to the console
 *   const useCase = new CreateUserUseCase({});
 *   await useCase.execute({ email: 'user@example.com' });
 *   // → Logs to console
 *
 *   // Disable logging (for tests or silent mode)
 *   const silentUseCase = new CreateUserUseCase({
 *     logging: NoOpLoggingAdapter
 *   });
 *   await silentUseCase.execute({ email: 'user@example.com' });
 *   // → No output
 *
 *   // Custom logger
 *   const customUseCase = new CreateUserUseCase({
 *     logging: myCustomLogger
 *   });
 *   ```;
 *
 * @template TInput - The input type for the use case
 * @template TOutput - The output type for the use case
 */
export abstract class Usecase<
  TInput = void,
  TOutput = void
> extends ServiceBase {
  constructor(
    protected readonly dependencies: UsecaseExecutionConfiguration = {}
  ) {
    super(dependencies);
  }

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
    const startTime = this.clock.now();
    const executionId = this.getExecutionId();
    const baseContext = { executionId, ...(executionContext ?? {}) };

    if (cancellationToken?.isCancelled) {
      this.metrics.increment('usecase_cancelled', {
        executionId: String(executionId)
      });
      return failure(
        new Error(cancellationToken.reason ?? 'Cancellation requested')
      );
    }

    try {
      const result = await this.executeInternal(
        input,
        this.logger,
        cancellationToken
      );

      const durationMs = this.clock.now() - startTime;
      this.logger.info('Execution completed', { ...baseContext, durationMs });
      this.metrics.histogram('usecase_duration', durationMs);

      return success(result);
    } catch (error) {
      const durationMs = this.clock.now() - startTime;
      this.logger.error('Execution failed', { ...baseContext, durationMs });
      this.metrics.increment('usecase_errors', {
        executionId: String(executionId)
      });

      return failure(this.normalizeError(error));
    }
  }

  private getExecutionId(): UniqueIdentifier {
    return (
      this.dependencies.identifier?.generate(this.clock) ??
      SystemIdentifierAdapter.generate(this.clock)
    );
  }

  private normalizeError(error: unknown): Error {
    return error instanceof Error ? error : new Error(String(error));
  }
}
