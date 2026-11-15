/**
 * Discriminated union for a use-case outcome.
 *
 * `Usecase.execute(...)` returns this contract for success/failure outcomes.
 *
 * @template TSuccess Success value type.
 * @template TFailure Failure type. Defaults to `Error`.
 */
export type UsecaseResult<TSuccess, TFailure = Error> =
  { success: true; value: TSuccess } | { success: false; error: TFailure };
