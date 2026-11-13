import { describe, expect, it } from 'bun:test';

import { UnitOfWorkBase } from './unit-of-work.base';

class TestUnitOfWork extends UnitOfWorkBase {
  commitCalls = 0;
  rollbackCalls = 0;

  async commit(): Promise<void> {
    this.commitCalls += 1;
  }

  async rollback(): Promise<void> {
    this.rollbackCalls += 1;
  }
}

describe('UnitOfWorkBase', () => {
  it('commits and returns the callback result on success', async () => {
    const uw = new TestUnitOfWork();

    const result = await uw.transaction(async () => 'ok');

    expect(result).toBe('ok');
    expect(uw.commitCalls).toBe(1);
    expect(uw.rollbackCalls).toBe(0);
  });

  it('rolls back and rethrows when the callback fails', async () => {
    const uw = new TestUnitOfWork();
    const error = new Error('boom');

    try {
      await uw.transaction(async () => {
        throw error;
      });
      throw new Error('Expected transaction to reject');
    } catch (caught) {
      expect(caught).toBe(error);
    }

    expect(uw.rollbackCalls).toBe(1);
    expect(uw.commitCalls).toBe(0);
  });
});
