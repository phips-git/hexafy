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

const MAX_RETRY_DELAY_MS = 30_000;

/** Retry policy for transient infrastructure failures. */
export interface UsecaseRetryConfiguration {
  /** Total attempts including the initial call. */
  attempts?: number;
  /** Delay before the first retry in milliseconds. */
  delayMs?: number;
  /** Additional delay added per retry in milliseconds. */
  backoffMs?: number;
  /** Predicate used to decide whether an error is retriable. */
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

/** Optional execution policy for a use case. */
export interface UsecaseConfiguration {
  clock?: ClockPort;
  /** Logger implementation. Defaults to the console logger. */
  logging?: LoggingPort;
  /** Metrics implementation. Defaults to a no-op adapter. */
  metrics?: MetricsPort;
  identifier?: IdentifierPort;
  /** Per-attempt timeout in milliseconds. */
  timeoutMs?: number;
  /** Retry policy for transient failures. */
  retry?: UsecaseRetryConfiguration;
}

/**
 * Base class for application use cases.
 *
 * Subclasses implement domain logic and receive shared infrastructure ports,
 * execution tracking, and optional timeout/retry policy.
 *
 * @template TInput Input type.
 * @template TOutput Output type.
 */
export abstract class Usecase<
  TInput = void,
  TOutput = void
> extends ServiceBase {
  constructor(protected readonly dependencies: UsecaseConfiguration = {}) {
    super(dependencies);
    this.validateConfiguration(dependencies);
  }

  /** Implements the use case logic. Return a value or throw an error. */
  protected abstract executeInternal(
    input: TInput,
    logger: LoggingPort,
    cancellationToken?: CancellationToken
  ): Promise<TOutput>;

  /**
   * Runs the use case and returns a success/failure result.
   *
   * @param input Use-case input.
   * @param executionContext Optional log context.
   * @param cancellationToken Optional cancellation signal.
   * @returns A typed success/failure result.
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
      this.metrics.increment('usecase_cancelled');
      return failure(
        new Error(cancellationToken.reason ?? 'Cancellation requested')
      );
    }

    try {
      const result = this.dependencies.retry
        ? await this.runWithRetry(input, cancellationToken)
        : await this.runAttempt(input, cancellationToken);

      const durationMs = this.clock.now() - startTime;
      this.logger.info('Execution completed', { ...baseContext, durationMs });
      this.metrics.histogram('usecase_duration', durationMs);

      return success(result);
    } catch (error) {
      const durationMs = this.clock.now() - startTime;
      this.logger.error('Execution failed', { ...baseContext, durationMs });
      this.metrics.increment('usecase_errors');

      return failure(this.normalizeError(error));
    }
  }

  private async runWithRetry(
    input: TInput,
    cancellationToken?: CancellationToken | undefined
  ): Promise<TOutput> {
    const retry = this.dependencies.retry!;
    const maxAttempts = Math.max(1, retry.attempts ?? 1);
    const shouldRetry = retry.shouldRetry ?? this.defaultShouldRetry;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        return await this.runAttempt(input, cancellationToken);
      } catch (error) {
        const normalizedError = this.normalizeError(error);

        if (cancellationToken?.isCancelled) {
          throw new Error(
            cancellationToken.reason ?? 'Cancellation requested',
            {
              cause: error
            }
          );
        }

        if (attempt >= maxAttempts || !shouldRetry(normalizedError, attempt)) {
          throw normalizedError;
        }

        this.metrics.increment('usecase_retries');

        const delayMs = this.calculateRetryDelayMs(retry, attempt);

        if (delayMs > 0) {
          await this.delay(delayMs, cancellationToken);
        }
      }
    }

    throw new Error('Usecase retry loop exited without a result');
  }

  private async runAttempt(
    input: TInput,
    cancellationToken?: CancellationToken | undefined
  ): Promise<TOutput> {
    const timeoutMs = this.dependencies.timeoutMs;
    if (timeoutMs === undefined || timeoutMs <= 0) {
      return this.executeInternal(input, this.logger, cancellationToken);
    }

    const timeoutState = { timedOut: false };
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const timeoutToken = this.createTimeoutCancellationToken(
      timeoutMs,
      cancellationToken,
      timeoutState
    );

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        timeoutState.timedOut = true;
        const error = new Error(`Execution timed out after ${timeoutMs} ms`);
        this.metrics.increment('usecase_timeout');
        reject(error);
      }, timeoutMs);
    });

    return Promise.race([
      this.executeInternal(input, this.logger, timeoutToken),
      timeoutPromise
    ]).finally(() => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    });
  }

  private createTimeoutCancellationToken(
    timeoutMs: number,
    cancellationToken: CancellationToken | undefined,
    timeoutState: { timedOut: boolean }
  ): CancellationToken {
    return {
      get isCancelled(): boolean {
        return timeoutState.timedOut || cancellationToken?.isCancelled === true;
      },
      get reason(): string | undefined {
        return timeoutState.timedOut
          ? `Execution timed out after ${timeoutMs} ms`
          : cancellationToken?.reason;
      }
    } satisfies CancellationToken;
  }

  private delay(
    ms: number,
    cancellationToken?: CancellationToken
  ): Promise<void> {
    const safeMs = Number.isFinite(ms)
      ? Math.max(0, Math.min(ms, MAX_RETRY_DELAY_MS))
      : 0;

    if (safeMs <= 0) {
      return Promise.resolve();
    }

    if (!cancellationToken) {
      return new Promise((resolve) => setTimeout(resolve, safeMs));
    }

    return new Promise((resolve, reject) => {
      if (cancellationToken.isCancelled) {
        reject(new Error(cancellationToken.reason ?? 'Cancellation requested'));
        return;
      }

      let settled = false;
      const timeoutId = setTimeout(() => {
        settle(resolve);
      }, safeMs);
      const checkId = setInterval(() => {
        if (cancellationToken.isCancelled) {
          settle(() => {
            reject(
              new Error(cancellationToken.reason ?? 'Cancellation requested')
            );
          });
        }
      }, 10);

      const settle = (callback: () => void): void => {
        if (settled) {
          return;
        }

        settled = true;
        clearTimeout(timeoutId);
        clearInterval(checkId);
        callback();
      };
    });
  }

  private validateConfiguration(config: UsecaseConfiguration): void {
    if (config.timeoutMs !== undefined) {
      if (!Number.isFinite(config.timeoutMs) || config.timeoutMs <= 0) {
        throw new RangeError(
          'Usecase timeoutMs must be a finite number greater than 0.'
        );
      }
    }

    if (config.retry === undefined) {
      return;
    }

    const attempts = config.retry.attempts ?? 1;
    if (!Number.isInteger(attempts) || attempts <= 0) {
      throw new RangeError(
        'Usecase retry.attempts must be a positive integer.'
      );
    }

    if (
      config.retry.delayMs !== undefined &&
      (!Number.isFinite(config.retry.delayMs) || config.retry.delayMs < 0)
    ) {
      throw new RangeError(
        'Usecase retry.delayMs must be a finite number greater than or equal to 0.'
      );
    }

    if (
      config.retry.backoffMs !== undefined &&
      (!Number.isFinite(config.retry.backoffMs) || config.retry.backoffMs < 0)
    ) {
      throw new RangeError(
        'Usecase retry.backoffMs must be a finite number greater than or equal to 0.'
      );
    }
  }

  private calculateRetryDelayMs(
    retry: UsecaseRetryConfiguration,
    attempt: number
  ): number {
    const baseDelayMs = Math.max(0, retry.delayMs ?? 0);
    const backoffDelayMs =
      Math.max(0, attempt - 1) * Math.max(0, retry.backoffMs ?? 0);
    const totalDelayMs = baseDelayMs + backoffDelayMs;

    if (!Number.isFinite(totalDelayMs)) {
      return MAX_RETRY_DELAY_MS;
    }

    return Math.min(totalDelayMs, MAX_RETRY_DELAY_MS);
  }

  private defaultShouldRetry(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false;
    }

    if (/cancelled|aborted|abort/i.test(error.message)) {
      return false;
    }

    return /timed out|timeout|temporar|temporary|network|fetch failed|econnreset|econnrefused|etimedout|429|503|502|504|rate limit|socket hang up/i.test(
      error.message
    );
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
