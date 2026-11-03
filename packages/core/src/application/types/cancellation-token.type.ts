/**
 * Token for requesting use case cancellation.
 *
 * Provides a way to signal that a use case execution should be aborted. Useful
 * for implementing timeouts, user-initiated cancellation, or long-running
 * operations that can be interrupted.
 *
 * @example
 *   ```typescript
 *   // Create a cancellation token
 *   const controller = new AbortController();
 *   const token: CancellationToken = {
 *     isCancelled: controller.signal.aborted,
 *     reason: 'Operation timed out'
 *   };
 *
 *   // Execute use case with cancellation
 *   await useCase.execute(data, context, token);
 *   ```
 *
 * @param isCancelled - Whether cancellation has been requested
 * @param reason - Optional reason for cancellation
 */
export interface CancellationToken {
  readonly isCancelled: boolean;
  readonly reason?: string;
}
