import { afterEach, describe, expect, it } from 'bun:test';

import { JSONConsoleLoggingAdapter } from './json-console.logging.adapter';

describe('JSONConsoleLoggingAdapter', () => {
  afterEach(() => {
    console.info = globalThis.console.info;
    console.warn = globalThis.console.warn;
    console.error = globalThis.console.error;
  });

  it('serializes log payload with component and context', () => {
    const calls: unknown[][] = [];
    console.info = (...args: unknown[]) => calls.push(args);

    const logger = JSONConsoleLoggingAdapter('core');
    logger.info('hello', { requestId: 'r1' });

    const payload = JSON.parse(String(calls[0]?.[0])) as {
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
    const calls: unknown[][] = [];
    console.error = (...args: unknown[]) => calls.push(args);

    const logger = JSONConsoleLoggingAdapter('core');

    const nested = new Error('nested');
    const root = new Error('root', { cause: nested });
    (root as Error & { detail: unknown }).detail = { a: 1 };

    const circular: { self?: unknown } = {};
    circular.self = circular;

    logger.error('boom', { root, circular });
    const payload = JSON.parse(String(calls[0]?.[0])) as {
      root: { name: string; message: string; cause: { message: string } };
      circular: { self: string };
    };

    expect(payload.root.name).toBe('Error');
    expect(payload.root.message).toBe('root');
    expect(payload.root.cause.message).toBe('nested');
    expect(payload.circular.self).toBe('[Circular]');
  });

  it('marks circular Error cause and skips reserved error keys', () => {
    const calls: unknown[][] = [];
    console.error = (...args: unknown[]) => calls.push(args);

    const logger = JSONConsoleLoggingAdapter();

    const loop = new Error('loop') as Error & {
      cause?: unknown;
      logLevel?: string;
    };
    loop.cause = loop;
    loop.logLevel = 'debug';

    logger.error('loop', { loop });
    const payload = JSON.parse(String(calls[0]?.[0])) as {
      loop: { cause: { _circular: boolean }; logLevel?: string };
    };

    expect(payload.loop.cause._circular).toBe(true);
    expect(payload.loop.logLevel).toBeUndefined();
  });

  it('handles non-plain objects and serialization fallback', () => {
    const calls: unknown[][] = [];
    console.warn = (...args: unknown[]) => calls.push(args);

    const logger = JSONConsoleLoggingAdapter();

    const when = new Date('2026-01-01T00:00:00.000Z');
    logger.warn('date', { when, values: [{ n: 1 }] });
    const normalPayload = JSON.parse(String(calls[0]?.[0])) as {
      when: string;
      values: Array<{ n: number }>;
    };
    expect(normalPayload.when).toBe(when.toISOString());
    expect(normalPayload.values[0]?.n).toBe(1);

    logger.warn('bigint', { value: 1n });
    const fallbackPayload = JSON.parse(String(calls[1]?.[0])) as {
      message: string;
      _serializationError?: string;
    };
    expect(fallbackPayload.message).toBe('bigint');
    expect(fallbackPayload._serializationError).toBe(
      'Failed to serialize full log entry'
    );
  });

  it('routes levels to matching console methods', () => {
    const infoCalls: unknown[][] = [];
    const debugCalls: unknown[][] = [];
    const warnCalls: unknown[][] = [];
    const errorCalls: unknown[][] = [];

    console.info = (...args: unknown[]) => infoCalls.push(args);
    console.debug = (...args: unknown[]) => debugCalls.push(args);
    console.warn = (...args: unknown[]) => warnCalls.push(args);
    console.error = (...args: unknown[]) => errorCalls.push(args);

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
