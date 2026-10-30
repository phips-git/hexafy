export interface CancellationToken {
  readonly isCancelled: boolean;
  readonly reason?: string;
}
