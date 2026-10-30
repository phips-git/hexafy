import { UsecaseResult } from '../types';

export function isSuccess<T, E extends Error>(
  result: UsecaseResult<T, E>
): result is { success: true; value: T } {
  return result.success === true;
}

export function isFailure<T, E extends Error>(
  result: UsecaseResult<T, E>
): result is { success: false; error: E } {
  return result.success === false;
}

export function success<T>(value: T): UsecaseResult<T, never> {
  return { success: true, value };
}

export function failure<TError extends Error>(
  error: TError
): UsecaseResult<never, TError> {
  return { success: false, error };
}

export function unwrap<TSuccess, TError>(
  result: UsecaseResult<TSuccess, TError>
): TSuccess {
  if (result.success) {
    return result.value;
  }
  throw result.error;
}
