import type { UsecaseResult } from '../types';

/**
 * Type guard to check if a UsecaseResult represents success.
 *
 * @template T - The type of the success value
 * @template E - The type of the error
 * @param result - The result to check
 * @returns True if the result is a success
 */
export function isSuccess<T, E extends Error>(
  result: UsecaseResult<T, E>
): result is { success: true; value: T } {
  return result.success === true;
}

/**
 * Type guard to check if a UsecaseResult represents failure.
 *
 * @template T - The type of the success value
 * @template E - The type of the error
 * @param result - The result to check
 * @returns True if the result is a failure
 */
export function isFailure<T, E extends Error>(
  result: UsecaseResult<T, E>
): result is { success: false; error: E } {
  return result.success === false;
}

/**
 * Result type indicating a successful use case execution.
 *
 * @template T - The type of the success value
 * @param value - The successfully computed value
 */
export function success<T>(value: T): UsecaseResult<T, never> {
  return { success: true, value };
}

/**
 * Result type indicating a failed use case execution.
 *
 * @template TError - The type of the error
 * @param error - The error that occurred
 */
export function failure<TError extends Error>(
  error: TError
): UsecaseResult<never, TError> {
  return { success: false, error };
}

/**
 * Extracts the value from a successful UsecaseResult.
 *
 * @template TSuccess - The type of the success value
 * @template TError - The type of the error
 * @param result - The result to unwrap
 * @returns The success value
 * @throws {Error} If the result represents a failure
 */
export function unwrap<TSuccess, TError>(
  result: UsecaseResult<TSuccess, TError>
): TSuccess {
  if (result.success) {
    return result.value;
  }
  throw result.error;
}
