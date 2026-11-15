import type { LoggingPort } from '@hexafy/core/application';

/** Configuration for {@link CorrelationLoggerAdapter}. */
export interface CorrelationLoggerAdapterOptions {
  /**
   * Produces a correlation id per log call.
   *
   * If omitted, an existing `correlationId` from the log context is reused.
   */
  correlationIdFactory?: (context?: Record<string, unknown>) => string;
}

/**
 * Logging adapter that enriches each log entry with a `correlationId`.
 *
 * This is useful for request or execution trace correlation across services.
 */
export class CorrelationLoggerAdapter implements LoggingPort {
  constructor(
    private readonly delegate: LoggingPort,
    private readonly options: CorrelationLoggerAdapterOptions = {}
  ) {}

  info(message: string, data?: unknown): void {
    this.delegate.info(message, this.withCorrelationId(data));
  }

  debug(message: string, data?: unknown): void {
    this.delegate.debug(message, this.withCorrelationId(data));
  }

  warn(message: string, data?: unknown): void {
    this.delegate.warn(message, this.withCorrelationId(data));
  }

  error(message: string, data?: unknown): void {
    this.delegate.error(message, this.withCorrelationId(data));
  }

  private withCorrelationId(
    data?: unknown
  ): Record<string, unknown> | undefined {
    const context = this.normalizeContext(data);
    const correlationId =
      this.options.correlationIdFactory?.(context) ??
      (context && typeof context['correlationId'] === 'string'
        ? context['correlationId']
        : undefined);

    if (!context && correlationId === undefined) {
      return undefined;
    }

    return {
      ...(context ?? {}),
      ...(correlationId !== undefined && { correlationId })
    };
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
}
