import { describe, expect, it } from 'bun:test';

import { ServiceBase } from './service.base';

class TestService extends ServiceBase {}

describe('ServiceBase', () => {
  it('uses default logger, clock, and metrics when no configuration is provided', () => {
    const service = new TestService();

    expect(service['logger']).toBeDefined();
    expect(service['clock']).toBeDefined();
    expect(service['metrics']).toBeDefined();
  });

  it('uses injected logger, clock, and metrics when provided', () => {
    const logging = {
      info: () => {},
      debug: () => {},
      warn: () => {},
      error: () => {}
    };
    const clock = { now: () => 123 };
    const metrics = {
      increment: () => {},
      histogram: () => {},
      gauge: () => {}
    };

    const service = new TestService({
      logging,
      clock,
      metrics
    });

    expect(service['logger']).toBe(logging);
    expect(service['clock']).toBe(clock);
    expect(service['metrics']).toBe(metrics);
  });
});
