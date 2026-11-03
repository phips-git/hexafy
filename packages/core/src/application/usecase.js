import { SystemClockAdapter } from '../infrastructure/adapters/clock';
import { SystemIdentifierAdapter } from '../infrastructure/adapters/identifier';
import { ConsoleLoggingAdapter } from '../infrastructure/adapters/logging';
import { NoOpMetricsAdapter } from '../infrastructure/adapters/metrics';
import { failure, success } from './utils';
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
export class Usecase {
    dependencies;
    constructor(dependencies = {}) {
        this.dependencies = dependencies;
    }
    /**
     * Execute the use case.
     *
     * @param input - The input data for the use case
     * @param executionContext - Additional context to include in logs
     * @param cancellationToken - Optional token for requesting cancellation
     * @returns Promise resolving to a Result (success or failure)
     */
    async execute(input, executionContext, cancellationToken) {
        const startTime = this.getNow();
        const executionId = this.getExecutionId();
        const baseContext = { executionId, ...(executionContext ?? {}) };
        const logger = this.getOrCreateLoggingAdapter();
        const metrics = this.getOrCreateMetricsAdapter();
        if (cancellationToken?.isCancelled) {
            metrics.increment('usecase_cancelled', {
                executionId: String(executionId)
            });
            return failure(new Error(cancellationToken.reason ?? 'Cancellation requested'));
        }
        try {
            const result = await this.executeInternal(input, logger, cancellationToken);
            const durationMs = this.getNow() - startTime;
            logger.info('Execution completed', { ...baseContext, durationMs });
            metrics.histogram('usecase_duration', durationMs);
            return success(result);
        }
        catch (error) {
            const durationMs = this.getNow() - startTime;
            logger.error('Execution failed', { ...baseContext, durationMs });
            metrics.increment('usecase_errors', { executionId: String(executionId) });
            return failure(this.normalizeError(error));
        }
    }
    getNow() {
        return this.dependencies.clock?.now() ?? SystemClockAdapter.now();
    }
    getExecutionId() {
        return (this.dependencies.identifier?.generate(this.getNowAdapter()) ??
            SystemIdentifierAdapter.generate(this.getNowAdapter()));
    }
    getNowAdapter() {
        return this.dependencies.clock ?? SystemClockAdapter;
    }
    getOrCreateLoggingAdapter() {
        return this.dependencies.logging ?? ConsoleLoggingAdapter;
    }
    getOrCreateMetricsAdapter() {
        return this.dependencies.metrics ?? NoOpMetricsAdapter;
    }
    normalizeError(error) {
        return error instanceof Error ? error : new Error(String(error));
    }
}
