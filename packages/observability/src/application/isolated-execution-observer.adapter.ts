import type {
  ClockPort,
  IdentifierPort,
  LoggingPort
} from '@hexafy/core/application';
import {
  ConsoleLoggingAdapter,
  SystemClockAdapter,
  SystemIdentifierAdapter
} from '@hexafy/core/infrastructure';

import {
  AggregatingLoggerAdapter,
  type ExecutionLogEntry
} from '../infrastructure/aggregating.logger.adapter';
import { CorrelationLoggerAdapter } from '../infrastructure/correlation.logger.adapter';
import {
  type LogLevel,
  resolveLogLevelFromError
} from '../infrastructure/domain-error-level.logger.adapter';

/** Configuration for {@link IsolatedExecutionObserverAdapter}. */
export interface IsolatedExecutionObserverAdapterOptions {
  /** Creates a logger instance for each observed execution name. */
  loggerFactory?: (loggerName: string) => LoggingPort;
  /** Generator used to create execution correlation ids. */
  executionIdGenerator?: IdentifierPort;
  /** Clock used to compute durations. */
  clock?: ClockPort;
  /** Optional error-to-severity resolver for failed executions. */
  logLevelResolver?: (error: unknown) => LogLevel;
}

/**
 * Execution-level observability contract for isolated execution units.
 *
 * Use this for detached/background work, fan-out batch units, or workflow steps
 * that need an execution envelope separate from the parent use case.
 */
export interface IsolatedExecutionObserver {
  /** Observes one async execution and emits structured completion/failure logs. */
  observe<T>(
    loggerName: string,
    task: (logger: LoggingPort) => Promise<T>,
    executionContext?: Record<string, unknown>
  ): Promise<T>;

  /**
   * Starts an observed task without awaiting it.
   *
   * Rejections are internally captured to avoid unhandled rejections.
   */
  observeBackground<T>(
    loggerName: string,
    task: (logger: LoggingPort) => Promise<T>,
    executionContext?: Record<string, unknown>
  ): void;
}

/**
 * Observes isolated execution units with their own correlation envelope.
 *
 * It composes correlation + aggregation adapters and emits one summary event
 * per successful execution, or one failure event on error.
 *
 * Prefer the injected `LoggingPort` directly inside `Usecase.executeInternal`
 * and `ServiceBase` methods. Use this adapter when work should be tracked as a
 * separate execution unit.
 */
export class IsolatedExecutionObserverAdapter implements IsolatedExecutionObserver {
  constructor(
    private readonly options: IsolatedExecutionObserverAdapterOptions = {}
  ) {}

  async observe<T>(
    loggerName: string,
    task: (logger: LoggingPort) => Promise<T>,
    executionContext: Record<string, unknown> = {}
  ): Promise<T> {
    const clock = this.options.clock ?? SystemClockAdapter;
    const executionIdGenerator =
      this.options.executionIdGenerator ?? SystemIdentifierAdapter;
    const loggerFactory =
      this.options.loggerFactory ?? (() => ConsoleLoggingAdapter);
    const startedAt = clock.now();
    const executionId = executionIdGenerator.generate(clock);

    const logger = new CorrelationLoggerAdapter(loggerFactory(loggerName), {
      correlationIdFactory: () => String(executionId)
    });
    const aggregator = new AggregatingLoggerAdapter(logger);

    try {
      const result = await task(aggregator);
      const durationMs = clock.now() - startedAt;
      aggregator.flush({
        ...executionContext,
        executionId,
        loggerName,
        durationMs
      });

      return result;
    } catch (error) {
      const durationMs = clock.now() - startedAt;
      const resolver =
        this.options.logLevelResolver ?? resolveLogLevelFromError;
      const summary = {
        ...executionContext,
        executionId,
        loggerName,
        durationMs,
        error,
        events: aggregator.getEntries() as readonly ExecutionLogEntry[]
      };

      switch (resolver(error)) {
        case 'warn':
          logger.warn('Execution failed', summary);
          break;
        case 'error':
          logger.error('Execution failed', summary);
          break;
        case 'info':
        default:
          logger.info('Execution failed', summary);
          break;
      }

      throw error;
    }
  }

  observeBackground<T>(
    loggerName: string,
    task: (logger: LoggingPort) => Promise<T>,
    executionContext: Record<string, unknown> = {}
  ): void {
    void this.observe(loggerName, task, executionContext).catch(
      () => undefined
    );
  }
}
