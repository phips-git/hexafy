/**
 * Discriminated union for a use-case outcome.
 *
 * Use it to model success/failure without exceptions in application code.
 *
 * @template TSuccess Success value type.
 * @template TFailure Failure type. Defaults to `Error`.
 */
export type UsecaseResult<TSuccess, TFailure = Error> =
  { success: true; value: TSuccess } | { success: false; error: TFailure };
