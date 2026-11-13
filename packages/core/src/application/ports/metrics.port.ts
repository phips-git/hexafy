/** Port for metric emission. */
export interface MetricsPort {
  /** Increments a counter metric. */
  increment(metric: string, labels?: Record<string, string>): void;

  /** Records a histogram sample. */
  histogram(
    metric: string,
    value: number,
    labels?: Record<string, string>
  ): void;

  /** Records a gauge value. */
  gauge(metric: string, value: number, labels?: Record<string, string>): void;
}
