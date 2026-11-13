/**
 * Cancellation signal for a use case execution.
 *
 * The `reason` field is `string | undefined` to remain compatible with
 * `exactOptionalPropertyTypes` while still representing an optional message.
 */
export interface CancellationToken {
  readonly isCancelled: boolean;
  readonly reason: string | undefined;
}
