import { describe, expect, it } from 'bun:test';

import { ApplicationError, ValidationError } from './application.error';
import { getDomainErrorCode, isDomainError } from './domain-error.guard';

describe('domain-error.guard', () => {
  it('detects domain errors by class, known name, and code', () => {
    expect(isDomainError(new ValidationError())).toBe(true);

    const named = new Error('named');
    named.name = 'ForbiddenError';
    expect(isDomainError(named)).toBe(true);

    const withCode = new Error('coded') as Error & { code: string };
    withCode.code = 'NOT_FOUND';
    expect(isDomainError(withCode)).toBe(true);

    expect(isDomainError(new Error('plain'))).toBe(false);
    expect(isDomainError('not-an-error')).toBe(false);
  });

  it('returns explicit codes as-is', () => {
    const withCode = new Error('x') as Error & { code: string };
    withCode.code = 'NOT_FOUND_ERROR';
    expect(getDomainErrorCode(withCode)).toBe('NOT_FOUND_ERROR');

    const custom = new Error('x') as Error & { code: string };
    custom.code = 'CUSTOM_CODE';
    expect(getDomainErrorCode(custom)).toBe('CUSTOM_CODE');

    const trimmed = new Error('x') as Error & { code: string };
    trimmed.code = ' NOT_FOUND ';
    expect(getDomainErrorCode(trimmed)).toBe('NOT_FOUND');
  });

  it('derives codes from error names', () => {
    const byName = new Error('x');
    byName.name = 'ValidationError';
    expect(getDomainErrorCode(byName)).toBe('VALIDATION_ERROR');

    const appByNameOnly = new Error('x');
    appByNameOnly.name = 'ApplicationError';
    expect(getDomainErrorCode(appByNameOnly)).toBe('APPLICATION_ERROR');

    const app = new ApplicationError('x');
    expect(getDomainErrorCode(app)).toBe('APPLICATION_ERROR');
  });

  it('returns undefined for unknown errors', () => {
    expect(getDomainErrorCode(new Error('plain'))).toBeUndefined();
  });
});
