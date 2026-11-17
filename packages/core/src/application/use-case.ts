import type { UniqueIdentifier } from '../domain/primitives';
import { SystemIdentifierAdapter } from '../infrastructure/adapters';
import type {
  ClockPort,
  IdentifierPort,
  LoggingPort,
  MetricsPort
} from './ports';
import { ServiceBase } from './service.base';
import {
  UsecaseCancelledError,
  type UsecaseResult,
  UsecaseTimeoutError
} from './types';

const MAX_TIMEOUT_MS = 2_147_483_647;
const USE_CASE_METRICS = {
  CANCELLED: 'use_case_cancelled',
  DURATION: 'use_case_duration',
  ERRORS: 'use_case_errors',
  TIMEOUT: 'use_case_timeout'
} as const;

export interface UseCaseExecutionOptions {
  readonly executionContext?: Record<string, unknown> | undefined;
  readonly signal?: AbortSignal | undefined;
}

export interface UseCaseConfiguration {
  readonly clock?: ClockPort | undefined;
  readonly logging?: LoggingPort | undefined;
  readonly metrics?: MetricsPort | undefined;
  readonly identifier?: IdentifierPort | undefined;
  readonly timeoutMs?: number | undefined;
}

export abstract class UseCase<
  TInput = void,
  TOutput = void
> extends ServiceBase {
  constructor(private readonly dependencies: UseCaseConfiguration = {}) {
    super(dependencies);
    this.validateConfiguration(dependencies);
  }

  protected abstract executeInternal(
    input: TInput,
    logger: LoggingPort,
    signal?: AbortSignal
  ): Promise<TOutput>;

  async execute(
    input: TInput,
    options: UseCaseExecutionOptions = {}
  ): Promise<UsecaseResult<TOutput, Error>> {
    const { executionContext, signal } = options;
    const startTime = this.clock.now();
    const executionId = this.getExecutionId();
    const context = { executionId, ...(executionContext ?? {}) };

    if (signal?.aborted) {
      this.tryRecordMetric(USE_CASE_METRICS.CANCELLED);
      return {
        success: false,
        error: new UsecaseCancelledError(
          this.normalizeAbortReason(signal.reason),
          signal.reason ?? signal
        )
      };
    }

    try {
      const result = await this.runAttempt(input, signal);

      const durationMs = this.clock.now() - startTime;
      this.tryLog('info', 'Execution completed', {
        ...context,
        durationMs
      });
      this.tryRecordMetric(USE_CASE_METRICS.DURATION, durationMs);

      return { success: true, value: result };
    } catch (error) {
      const durationMs = this.clock.now() - startTime;
      this.tryLog('error', 'Execution failed', { ...context, durationMs });
      this.tryRecordMetric(USE_CASE_METRICS.ERRORS);

      if (error instanceof Error) {
        return { success: false, error };
      }

      return {
        success: false,
        error: new Error(String(error), { cause: error })
      };
    }
  }

  private async runAttempt(
    input: TInput,
    signal?: AbortSignal
  ): Promise<TOutput> {
    const timeoutMs = this.dependencies.timeoutMs;
    if (timeoutMs === undefined || timeoutMs <= 0) {
      return this.executeInternal(input, this.logger, signal);
    }

    const timeoutController = new AbortController();
    const combinedSignal = this.mergeSignals(signal, timeoutController.signal);

    const timeoutId = setTimeout(() => {
      timeoutController.abort(
        new Error(`Execution timed out after ${timeoutMs} ms`)
      );
      this.tryRecordMetric(USE_CASE_METRICS.TIMEOUT);
    }, timeoutMs);

    try {
      return await Promise.race([
        this.executeInternal(input, this.logger, combinedSignal),
        new Promise<never>((_, reject) => {
          const onAbort = () => {
            if (signal?.aborted) {
              reject(
                new UsecaseCancelledError(
                  this.normalizeAbortReason(signal.reason),
                  signal.reason ?? signal
                )
              );
              return;
            }

            reject(
              new UsecaseTimeoutError(
                this.normalizeAbortReason(timeoutController.signal.reason) ||
                  `Execution timed out after ${timeoutMs} ms`,
                timeoutController.signal.reason
              )
            );
          };

          if (combinedSignal.aborted) {
            onAbort();
            return;
          }

          combinedSignal.addEventListener('abort', onAbort, { once: true });
        })
      ]);
    } finally {
      clearTimeout(timeoutId);
      timeoutController.abort();
    }
  }

  private mergeSignals(
    primarySignal: AbortSignal | undefined,
    secondarySignal: AbortSignal
  ): AbortSignal {
    if (typeof AbortSignal !== 'undefined' && 'any' in AbortSignal) {
      return primarySignal
        ? AbortSignal.any([primarySignal, secondarySignal])
        : secondarySignal;
    }

    if (!primarySignal) {
      return secondarySignal;
    }

    const controller = new AbortController();
    const onAbort = () => {
      controller.abort(primarySignal.reason ?? secondarySignal.reason);
    };

    if (primarySignal.aborted || secondarySignal.aborted) {
      onAbort();
      return controller.signal;
    }

    primarySignal.addEventListener('abort', onAbort, { once: true });
    secondarySignal.addEventListener('abort', onAbort, { once: true });
    return controller.signal;
  }

  private validateConfiguration(config: UseCaseConfiguration): void {
    if (config.timeoutMs !== undefined) {
      if (!Number.isFinite(config.timeoutMs) || config.timeoutMs <= 0) {
        throw new RangeError(
          'Usecase timeoutMs must be a finite number greater than 0.'
        );
      }

      if (config.timeoutMs > MAX_TIMEOUT_MS) {
        throw new RangeError(
          `Usecase timeoutMs must be less than or equal to ${MAX_TIMEOUT_MS}.`
        );
      }
    }
  }

  private getExecutionId(): UniqueIdentifier {
    return (
      this.dependencies.identifier?.generate(this.clock) ??
      SystemIdentifierAdapter.generate(this.clock)
    );
  }

  private normalizeAbortReason(reason: unknown): string {
    if (reason instanceof Error) {
      return reason.message;
    }

    if (reason === undefined) {
      return 'Cancellation requested';
    }

    return String(reason);
  }

  private tryLog(
    level: 'info' | 'error',
    message: string,
    data?: Record<string, unknown>
  ): void {
    try {
      if (level === 'info') {
        this.logger.info(message, data);
        return;
      }

      this.logger.error(message, data);
    } catch {
      // Best-effort instrumentation should never break use-case execution
    }
  }

  private tryRecordMetric(metric: string, value?: number): void {
    try {
      if (typeof value === 'number') {
        this.metrics.histogram(metric, value);
        return;
      }

      this.metrics.increment(metric);
    } catch {
      // Best-effort instrumentation should never break use-case execution
    }
  }
}
