import { afterEach, describe, expect, it } from 'bun:test';

import { ConsoleLoggingAdapter } from './console.logging.adapter';
import { JSONConsoleLoggingAdapter } from './json-console.logging.adapter';

type ConsoleCall = unknown[];

const originalConsole = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
  debug: console.debug
};

const captureConsoleMethod = (
  method: keyof typeof originalConsole
): ConsoleCall[] => {
  const calls: ConsoleCall[] = [];
  console[method] = ((...args: unknown[]) => {
    calls.push(args);
  }) as (...args: unknown[]) => void;
  return calls;
};

const restore = (): void => {
  console.log = originalConsole.log;
  console.info = originalConsole.info;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.debug = originalConsole.debug;
};

afterEach(restore);

describe('ConsoleLoggingAdapter', () => {
  it('writes to console with and without data', () => {
    const logCalls = captureConsoleMethod('log');
    const warnCalls = captureConsoleMethod('warn');
    const errorCalls = captureConsoleMethod('error');
    const debugCalls = captureConsoleMethod('debug');

    ConsoleLoggingAdapter.info('info');
    ConsoleLoggingAdapter.info('info-data', { ok: true });
    ConsoleLoggingAdapter.warn('warn');
    ConsoleLoggingAdapter.warn('warn-data', { ok: true });
    ConsoleLoggingAdapter.error('error');
    ConsoleLoggingAdapter.error('error-data', { ok: true });
    ConsoleLoggingAdapter.debug('debug');
    ConsoleLoggingAdapter.debug('debug-data', { ok: true });

    expect(logCalls).toEqual([['info'], ['info-data', { ok: true }]]);
    expect(warnCalls).toEqual([['warn'], ['warn-data', { ok: true }]]);
    expect(errorCalls).toEqual([['error'], ['error-data', { ok: true }]]);
    expect(debugCalls).toEqual([['debug'], ['debug-data', { ok: true }]]);
  });
});

describe('JSONConsoleLoggingAdapter', () => {
  it('serializes log payload with component and context', () => {
    const infoCalls = captureConsoleMethod('info');
    const logger = JSONConsoleLoggingAdapter('core');

    logger.info('hello', { requestId: 'r1' });

    const payload = JSON.parse(String(infoCalls[0]?.[0])) as {
      level: string;
      message: string;
      component?: string;
      requestId?: string;
      timestamp: string;
    };

    expect(payload.level).toBe('info');
    expect(payload.message).toBe('hello');
    expect(payload.component).toBe('core');
    expect(payload.requestId).toBe('r1');
    expect(typeof payload.timestamp).toBe('string');
  });

  it('normalizes Error and circular structures', () => {
    const errorCalls = captureConsoleMethod('error');
    const logger = JSONConsoleLoggingAdapter('core');

    const nested = new Error('nested');
    const root = new Error('root', { cause: nested });
    (root as Error & { detail: unknown }).detail = { a: 1 };

    const circular: { self?: unknown } = {};
    circular.self = circular;

    logger.error('boom', { root, circular });
    const payload = JSON.parse(String(errorCalls[0]?.[0])) as {
      root: { name: string; message: string; cause: { message: string } };
      circular: { self: string };
    };

    expect(payload.root.name).toBe('Error');
    expect(payload.root.message).toBe('root');
    expect(payload.root.cause.message).toBe('nested');
    expect(payload.circular.self).toBe('[Circular]');
  });

  it('marks circular Error cause and skips reserved error keys', () => {
    const errorCalls = captureConsoleMethod('error');
    const logger = JSONConsoleLoggingAdapter();

    const loop = new Error('loop') as Error & {
      cause?: unknown;
      logLevel?: string;
    };
    loop.cause = loop;
    loop.logLevel = 'debug';

    logger.error('loop', { loop });
    const payload = JSON.parse(String(errorCalls[0]?.[0])) as {
      loop: { cause: { _circular: boolean }; logLevel?: string };
    };

    expect(payload.loop.cause._circular).toBe(true);
    expect(payload.loop.logLevel).toBeUndefined();
  });

  it('handles non-plain objects and serialization fallback', () => {
    const warnCalls = captureConsoleMethod('warn');
    const logger = JSONConsoleLoggingAdapter();

    const when = new Date('2026-01-01T00:00:00.000Z');
    logger.warn('date', { when, values: [{ n: 1 }] });
    const normalPayload = JSON.parse(String(warnCalls[0]?.[0])) as {
      when: string;
      values: Array<{ n: number }>;
    };
    expect(normalPayload.when).toBe(when.toISOString());
    expect(normalPayload.values[0]?.n).toBe(1);

    logger.warn('bigint', { value: 1n });
    const fallbackPayload = JSON.parse(String(warnCalls[1]?.[0])) as {
      message: string;
      _serializationError?: string;
    };
    expect(fallbackPayload.message).toBe('bigint');
    expect(fallbackPayload._serializationError).toBe(
      'Failed to serialize full log entry'
    );
  });

  it('routes levels to matching console methods', () => {
    const infoCalls = captureConsoleMethod('info');
    const debugCalls = captureConsoleMethod('debug');
    const warnCalls = captureConsoleMethod('warn');
    const errorCalls = captureConsoleMethod('error');
    const logger = JSONConsoleLoggingAdapter();

    logger.info('i');
    logger.debug('d');
    logger.warn('w');
    logger.error('e');

    expect(infoCalls.length).toBe(1);
    expect(debugCalls.length).toBe(1);
    expect(warnCalls.length).toBe(1);
    expect(errorCalls.length).toBe(1);
  });
});
