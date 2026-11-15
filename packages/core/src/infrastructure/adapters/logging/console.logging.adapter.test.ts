import { afterEach, describe, expect, it } from 'bun:test';

import { ConsoleLoggingAdapter } from './console.logging.adapter';

describe('ConsoleLoggingAdapter', () => {
  afterEach(() => {
    console.log = globalThis.console.log;
    console.info = globalThis.console.info;
    console.warn = globalThis.console.warn;
    console.error = globalThis.console.error;
    console.debug = globalThis.console.debug;
  });

  it('writes to console with and without data', () => {
    const calls: unknown[][] = [];

    console.log = (...args: unknown[]) => calls.push(['log', ...args]);
    console.warn = (...args: unknown[]) => calls.push(['warn', ...args]);
    console.error = (...args: unknown[]) => calls.push(['error', ...args]);
    console.debug = (...args: unknown[]) => calls.push(['debug', ...args]);

    ConsoleLoggingAdapter.info('info');
    ConsoleLoggingAdapter.info('info-data', { ok: true });
    ConsoleLoggingAdapter.warn('warn');
    ConsoleLoggingAdapter.warn('warn-data', { ok: true });
    ConsoleLoggingAdapter.error('error');
    ConsoleLoggingAdapter.error('error-data', { ok: true });
    ConsoleLoggingAdapter.debug('debug');
    ConsoleLoggingAdapter.debug('debug-data', { ok: true });

    const logCalls = calls.filter((c) => c[0] === 'log');
    const warnCalls = calls.filter((c) => c[0] === 'warn');
    const errorCalls = calls.filter((c) => c[0] === 'error');
    const debugCalls = calls.filter((c) => c[0] === 'debug');

    expect(logCalls).toEqual([
      ['log', 'info'],
      ['log', 'info-data', { ok: true }]
    ]);
    expect(warnCalls).toEqual([
      ['warn', 'warn'],
      ['warn', 'warn-data', { ok: true }]
    ]);
    expect(errorCalls).toEqual([
      ['error', 'error'],
      ['error', 'error-data', { ok: true }]
    ]);
    expect(debugCalls).toEqual([
      ['debug', 'debug'],
      ['debug', 'debug-data', { ok: true }]
    ]);
  });
});
