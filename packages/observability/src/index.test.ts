import { describe, expect, it } from 'bun:test';

import type { LoggingPort } from '@hexafy/core/application';

import { IsolatedExecutionObserverAdapter } from './application';
import {
  AggregatingLoggerAdapter,
  CorrelationLoggerAdapter,
  DomainErrorLevelLoggerAdapter,
  resolveLogLevelFromError
} from './infrastructure';

class TestLogger implements LoggingPort {
  readonly entries: Array<{ level: string; message: string; data?: unknown }> =
    [];

  info(message: string, data?: unknown): void {
    this.entries.push({ level: 'info', message, data });
  }

  debug(message: string, data?: unknown): void {
    this.entries.push({ level: 'debug', message, data });
  }

  warn(message: string, data?: unknown): void {
    this.entries.push({ level: 'warn', message, data });
  }

  error(message: string, data?: unknown): void {
    this.entries.push({ level: 'error', message, data });
  }
}

describe('observability package', () => {
  it('adds correlation ids to log events', () => {
    const delegate = new TestLogger();
    const logger = new CorrelationLoggerAdapter(delegate, {
      correlationIdFactory: () => 'corr-123'
    });

    logger.info('started', { userId: 'u_1' });

    expect(delegate.entries).toHaveLength(1);
    expect(delegate.entries[0]).toMatchObject({
      level: 'info',
      message: 'started',
      data: {
        userId: 'u_1',
        correlationId: 'corr-123'
      }
    });
  });

  it('aggregates execution entries before a summary flush', () => {
    const delegate = new TestLogger();
    const logger = new AggregatingLoggerAdapter(delegate);

    logger.info('first step', { step: 1 });
    logger.warn('second step', { step: 2 });
    logger.flush({ executionId: 'exec-42' });

    expect(delegate.entries).toHaveLength(1);
    expect(delegate.entries[0]).toMatchObject({
      level: 'warn',
      message: 'Execution completed with warnings',
      data: {
        executionId: 'exec-42',
        events: [
          { level: 'info', message: 'first step', context: { step: 1 } },
          { level: 'warn', message: 'second step', context: { step: 2 } }
        ]
      }
    });
  });

  it('emits error summary level when any buffered event is error', () => {
    const delegate = new TestLogger();
    const logger = new AggregatingLoggerAdapter(delegate, {
      flushMessage: 'custom summary'
    });

    logger.error('broken', { code: 'E_BROKEN' });
    logger.flush();

    expect(delegate.entries).toHaveLength(1);
    expect(delegate.entries[0]).toMatchObject({
      level: 'error',
      message: 'custom summary',
      data: {
        events: [
          { level: 'error', message: 'broken', context: { code: 'E_BROKEN' } }
        ]
      }
    });
  });

  it('uses default error summary message when flushMessage is not configured', () => {
    const delegate = new TestLogger();
    const logger = new AggregatingLoggerAdapter(delegate);

    logger.error('broken');
    logger.flush();

    expect(delegate.entries).toHaveLength(1);
    expect(delegate.entries[0]).toMatchObject({
      level: 'error',
      message: 'Execution failed'
    });
  });

  it('normalizes scalar payloads into structured value context', () => {
    const delegate = new TestLogger();
    const logger = new AggregatingLoggerAdapter(delegate);

    logger.debug('debug event', 'plain-text');
    logger.flush();

    expect(delegate.entries).toHaveLength(1);
    expect(delegate.entries[0]).toMatchObject({
      level: 'info',
      data: {
        events: [
          {
            level: 'debug',
            message: 'debug event',
            context: { value: 'plain-text' }
          }
        ]
      }
    });
  });

  it('clears buffered entries after flush', () => {
    const delegate = new TestLogger();
    const logger = new AggregatingLoggerAdapter(delegate);

    logger.info('first');
    expect(logger.getEntries()).toHaveLength(1);
    logger.flush();
    expect(logger.getEntries()).toHaveLength(0);
  });

  it('reuses an existing correlation id when no factory is configured', () => {
    const delegate = new TestLogger();
    const logger = new CorrelationLoggerAdapter(delegate);

    logger.info('started', { correlationId: 'corr-existing' });

    expect(delegate.entries).toHaveLength(1);
    expect(delegate.entries[0]).toMatchObject({
      data: { correlationId: 'corr-existing' }
    });
  });

  it('passes through undefined data when no correlation id is available', () => {
    const delegate = new TestLogger();
    const logger = new CorrelationLoggerAdapter(delegate);

    logger.info('started');

    expect(delegate.entries).toHaveLength(1);
    expect(delegate.entries[0]).toEqual({
      level: 'info',
      message: 'started',
      data: undefined
    });
  });

  it('applies correlation enrichment for debug/warn/error methods', () => {
    const delegate = new TestLogger();
    const logger = new CorrelationLoggerAdapter(delegate, {
      correlationIdFactory: () => 'corr-xyz'
    });

    logger.debug('debug', 1);
    logger.warn('warn', { flag: true });
    logger.error('error', ['a']);

    expect(delegate.entries).toHaveLength(3);
    expect(delegate.entries[0]).toMatchObject({
      level: 'debug',
      data: { value: 1, correlationId: 'corr-xyz' }
    });
    expect(delegate.entries[1]).toMatchObject({
      level: 'warn',
      data: { flag: true, correlationId: 'corr-xyz' }
    });
    expect(delegate.entries[2]).toMatchObject({
      level: 'error',
      data: { value: ['a'], correlationId: 'corr-xyz' }
    });
  });

  it('executes an observed task and emits final execution metadata', async () => {
    const delegate = new TestLogger();
    const observer = new IsolatedExecutionObserverAdapter({
      loggerFactory: () => delegate
    });

    const result = await observer.observe(
      'LoadUser',
      async (taskLogger) => {
        taskLogger.info('started', { userId: 'u_1' });
        return 'done';
      },
      { userId: 'u_1' }
    );

    expect(result).toBe('done');
    expect(
      delegate.entries.some(
        (entry) =>
          entry.level === 'info' &&
          entry.message === 'Execution completed' &&
          typeof entry.data === 'object' &&
          entry.data !== null &&
          'executionId' in entry.data
      )
    ).toBe(true);
  });

  it('maps known error shapes to warn and error levels', () => {
    expect(resolveLogLevelFromError({ logLevel: 'warn' })).toBe('warn');
    expect(resolveLogLevelFromError({ logLevel: 'verbose' })).toBe('error');
    expect(resolveLogLevelFromError(new Error('timeout while fetching'))).toBe(
      'warn'
    );
    expect(resolveLogLevelFromError(new Error('unexpected failure'))).toBe(
      'error'
    );
  });

  it('supports background observation without throwing', async () => {
    const delegate = new TestLogger();
    const observer = new IsolatedExecutionObserverAdapter({
      loggerFactory: () => delegate
    });

    observer.observeBackground(
      'BackgroundSync',
      async (taskLogger) => {
        taskLogger.info('background start');
      },
      { source: 'job' }
    );

    await new Promise((resolve) => setTimeout(resolve, 5));

    expect(
      delegate.entries.some(
        (entry) =>
          entry.level === 'info' && entry.message === 'Execution completed'
      )
    ).toBe(true);
  });

  it('logs failed observed execution with resolver level and rethrows', async () => {
    const delegate = new TestLogger();
    const observer = new IsolatedExecutionObserverAdapter({
      loggerFactory: () => delegate,
      logLevelResolver: () => 'warn'
    });

    await expect(
      observer.observe('FailingTask', async () => {
        throw new Error('boom');
      })
    ).rejects.toThrow('boom');

    expect(
      delegate.entries.some(
        (entry) =>
          entry.level === 'warn' && entry.message === 'Execution failed'
      )
    ).toBe(true);
  });

  it('supports error and info resolver levels for failed executions', async () => {
    const errorDelegate = new TestLogger();
    const errorObserver = new IsolatedExecutionObserverAdapter({
      loggerFactory: () => errorDelegate,
      logLevelResolver: () => 'error'
    });
    await expect(
      errorObserver.observe('ErrorTask', async () => {
        throw new Error('failed');
      })
    ).rejects.toThrow('failed');

    const infoDelegate = new TestLogger();
    const infoObserver = new IsolatedExecutionObserverAdapter({
      loggerFactory: () => infoDelegate,
      logLevelResolver: () => 'info'
    });
    await expect(
      infoObserver.observe('InfoTask', async () => {
        throw new Error('failed');
      })
    ).rejects.toThrow('failed');

    expect(
      errorDelegate.entries.some(
        (entry) =>
          entry.level === 'error' && entry.message === 'Execution failed'
      )
    ).toBe(true);
    expect(
      infoDelegate.entries.some(
        (entry) =>
          entry.level === 'info' && entry.message === 'Execution failed'
      )
    ).toBe(true);
  });

  it('swallows background task rejections while still logging failure', async () => {
    const delegate = new TestLogger();
    const observer = new IsolatedExecutionObserverAdapter({
      loggerFactory: () => delegate
    });

    observer.observeBackground('BackgroundFailure', async () => {
      throw new Error('background boom');
    });

    await new Promise((resolve) => setTimeout(resolve, 5));

    expect(
      delegate.entries.some(
        (entry) =>
          entry.level === 'error' && entry.message === 'Execution failed'
      )
    ).toBe(true);
  });

  it('provides convenience error-level logging methods', () => {
    const delegate = new TestLogger();
    const logger = new DomainErrorLevelLoggerAdapter(delegate, () => 'warn');

    logger.fromError(new Error('ignored'), 'failure', { step: 'x' });

    expect(delegate.entries).toHaveLength(1);
    expect(delegate.entries[0]).toMatchObject({
      level: 'warn',
      message: 'failure',
      data: { step: 'x' }
    });
  });

  it('passes through all explicit levels in domain error logger adapter', () => {
    const delegate = new TestLogger();
    const logger = new DomainErrorLevelLoggerAdapter(delegate);

    logger.log('info', 'info');
    logger.log('warn', 'warn');
    logger.log('error', 'error');
    logger.debug('debug');

    expect(delegate.entries.map((entry) => entry.level)).toEqual([
      'info',
      'warn',
      'error',
      'debug'
    ]);
  });
});
