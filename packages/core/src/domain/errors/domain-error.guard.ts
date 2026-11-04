import { ApplicationError } from './application.error';

export interface DomainErrorLike extends Error {
  code?: string;
  context?: Record<string, unknown>;
}

const KNOWN_DOMAIN_ERROR_NAMES = new Set<string>([
  'ApplicationError',
  'ValidationError',
  'NotFoundError',
  'ConflictError',
  'UnauthorizedError',
  'ForbiddenError',
  'InvariantError'
]);

const DOMAIN_ERROR_CODE_ALIASES: Record<string, string> = {
  UNAUTHORIZED: 'UNAUTHORIZED_ERROR',
  FORBIDDEN: 'FORBIDDEN_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  CONFLICT: 'CONFLICT_ERROR'
};

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

export function getDomainErrorCode(error: Error): string | undefined {
  const explicitCode = readCode(error);
  if (explicitCode) {
    return DOMAIN_ERROR_CODE_ALIASES[explicitCode] ?? explicitCode;
  }

  const nameAsCode = toCodeFromName(error.name);
  return nameAsCode ?? undefined;
}

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

  const nameWithoutError = name.replace(/_ERROR$/, '');
  if (nameWithoutError !== name) {
    return nameWithoutError + '_ERROR';
  }
  return name.toUpperCase().concat('_ERROR');
}
