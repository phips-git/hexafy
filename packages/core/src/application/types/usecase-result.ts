/**
 * Result type for use case execution.
 *
 * Represents the outcome of a use case, either success with a value or failure
 * with an error. This discriminated union enables pattern matching for result
 * handling without requiring try/catch.
 *
 * @example
 *   ```typescript
 *   const result = await createUser({ email: 'user@example.com' });
 *
 *   if (result.success) {
 *     console.log('User created:', result.value.userId);
 *   } else {
 *     console.error('Failed:', result.error.message);
 *   }
 *   ```
 *
 * @template TSuccess - The type of the success value
 * @template TFailure - The type of the failure (default: Error)
 */
export type UsecaseResult<TSuccess, TFailure = Error> =
  { success: true; value: TSuccess } | { success: false; error: TFailure };
