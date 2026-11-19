import type { LoggingPort } from '@hexafy/core/application';
import { NoOpLoggingAdapter } from '@hexafy/core/infrastructure';

/** Severity used by execution event entries. */
export type ExecutionLogLevel = 'debug' | 'info' | 'warn' | 'error';

/** One buffered execution event captured by {@link AggregatingLoggerAdapter}. */
export interface ExecutionLogEntry {
  level: ExecutionLogLevel;
  message: string;
  context?: Record<string, unknown>;
}

/** Configuration for {@link AggregatingLoggerAdapter}. */
export interface AggregatingLoggerAdapterOptions {
  /**
   * Optional fixed summary message used by
   * {@link AggregatingLoggerAdapter.flush}.
   */
  flushMessage?: string;
}

/**
 * Logger adapter that buffers step-level log events and emits one summary log.
 *
 * Useful for use case level execution reporting where consumers want one final
 * structured event that includes all intermediate events.
 */
export class AggregatingLoggerAdapter implements LoggingPort {
  private readonly entries: Array<ExecutionLogEntry> = [];

  constructor(
    private readonly delegate: LoggingPort = NoOpLoggingAdapter,
    private readonly options: AggregatingLoggerAdapterOptions = {}
  ) {}

  info(message: string, data?: unknown): void {
    const entry: ExecutionLogEntry = { level: 'info', message };
    const context = this.normalizeContext(data);
    if (context !== undefined) {
      entry.context = context;
    }
    this.entries.push(entry);
  }

  debug(message: string, data?: unknown): void {
    const entry: ExecutionLogEntry = { level: 'debug', message };
    const context = this.normalizeContext(data);
    if (context !== undefined) {
      entry.context = context;
    }
    this.entries.push(entry);
  }

  warn(message: string, data?: unknown): void {
    const entry: ExecutionLogEntry = { level: 'warn', message };
    const context = this.normalizeContext(data);
    if (context !== undefined) {
      entry.context = context;
    }
    this.entries.push(entry);
  }

  error(message: string, data?: unknown): void {
    const entry: ExecutionLogEntry = { level: 'error', message };
    const context = this.normalizeContext(data);
    if (context !== undefined) {
      entry.context = context;
    }
    this.entries.push(entry);
  }

  getEntries(): readonly ExecutionLogEntry[] {
    return [...this.entries];
  }

  /**
   * Emits a consolidated summary log and clears the buffered events.
   *
   * @param context Additional summary context merged into the final payload.
   */
  flush(context: Record<string, unknown> = {}): void {
    const entries = [...this.entries];
    const summary = { ...context, events: entries };
    const summaryLevel = this.resolveSummaryLevel(entries);
    const message =
      this.options.flushMessage ?? this.defaultMessageForLevel(summaryLevel);

    switch (summaryLevel) {
      case 'error':
        this.delegate.error(message, summary);
        break;
      case 'warn':
        this.delegate.warn(message, summary);
        break;
      case 'debug':
      case 'info':
      default:
        this.delegate.info(message, summary);
        break;
    }

    this.entries.length = 0;
  }

  private normalizeContext(
    data?: unknown
  ): Record<string, unknown> | undefined {
    if (data === undefined) {
      return undefined;
    }

    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      return data as Record<string, unknown>;
    }

    return { value: data };
  }

  private resolveSummaryLevel(
    entries: readonly ExecutionLogEntry[]
  ): ExecutionLogLevel {
    if (entries.some((entry) => entry.level === 'error')) {
      return 'error';
    }

    if (entries.some((entry) => entry.level === 'warn')) {
      return 'warn';
    }

    if (entries.some((entry) => entry.level === 'debug')) {
      return 'debug';
    }

    return 'info';
  }

  private defaultMessageForLevel(level: ExecutionLogLevel): string {
    switch (level) {
      case 'error':
        return 'Execution failed';
      case 'warn':
        return 'Execution completed with warnings';
      case 'debug':
      case 'info':
      default:
        return 'Execution completed';
    }
  }
}
