export type UsecaseResult<TSuccess, TFailure = Error> =
  { success: true; value: TSuccess } | { success: false; error: TFailure };
