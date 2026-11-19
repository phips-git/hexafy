import { ApplicationError } from './application.error';

export interface DomainErrorLike extends Error {
  code?: string;
  context?: Record<string, unknown>;
}

/**
 * Type guard that checks if a value is a domain error.
 *
 * Returns true if the value is:
 *
 * - An instance of `ApplicationError`
 * - Has a name matching a known domain error class
 * - Has a `code` property with a domain error code
 */
export function isDomainError(value: unknown): value is DomainErrorLike {
  if (!(value instanceof Error)) {
    return false;
  }

  if (value instanceof ApplicationError) {
    return true;
  }

  if (KNOWN_DOMAIN_ERROR_NAMES.has(value.name)) {
    return true;
  }

  const code = readCode(value);
  return code !== undefined;
}

/**
 * Extracts the error code from an error, either from its `code` property or
 * derived from its `name`. Returns `undefined` if no code is found.
 */
export function getDomainErrorCode(error: Error): string | undefined {
  const explicitCode = readCode(error);
  if (explicitCode) {
    return explicitCode;
  }

  const nameAsCode = toCodeFromName(error.name);
  return nameAsCode ?? undefined;
}

const KNOWN_DOMAIN_ERROR_NAMES = new Set<string>([
  'ApplicationError',
  'ValidationError',
  'NotFoundError',
  'ConflictError',
  'UnauthorizedError',
  'ForbiddenError',
  'InvariantError',
  'InfrastructureError'
]);

function readCode(error: Error): string | undefined {
  const code = (error as DomainErrorLike).code;
  if (typeof code !== 'string' || code.trim().length === 0) {
    return undefined;
  }
  return code.trim().toUpperCase();
}

function toCodeFromName(name: string): string | null {
  if (!KNOWN_DOMAIN_ERROR_NAMES.has(name)) {
    return null;
  }

  if (name === 'ApplicationError') {
    return 'APPLICATION_ERROR';
  }

  const nameWithoutSuffix = name.replace(/Error$/, '');
  return nameWithoutSuffix
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toUpperCase()
    .concat('_ERROR');
}
