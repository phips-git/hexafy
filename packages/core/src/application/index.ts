/**
 * Application layer exports.
 *
 * Provides core use case execution infrastructure:
 *
 * - Usecase - Abstract base class for all use cases
 * - UsecaseResult - Result type for use case execution
 * - CancellationToken - Token for requesting execution cancellation
 * - Success/failure/unwrap - Result factory functions
 * - UsecaseExecutionConfiguration - Use case configuration
 */
export type { CancellationToken, UsecaseResult } from './types';
export { Usecase, type UsecaseExecutionConfiguration } from './usecase';
export { failure, success, unwrap } from './utils';
