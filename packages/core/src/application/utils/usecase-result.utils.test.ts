import { describe, expect, it } from 'bun:test';

import { failure, isFailure, isSuccess, success, unwrap } from './usecase-result.utils';

describe('usecase-result.utils', () => {
  it('detects success and failure results', () => {
    const ok = success('value');
    const err = failure(new Error('boom'));

    expect(isSuccess(ok)).toBe(true);
    expect(isFailure(ok)).toBe(false);
    expect(isSuccess(err)).toBe(false);
    expect(isFailure(err)).toBe(true);
  });

  it('unwrap returns value for success', () => {
    const result = success({ id: '1' });
    expect(unwrap(result)).toEqual({ id: '1' });
  });

  it('unwrap throws for failure', () => {
    const error = new Error('failed');
    const result = failure(error);
    expect(() => unwrap(result)).toThrow('failed');
  });
});
