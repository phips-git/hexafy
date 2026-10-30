/**
 * MetricPort - Interface for metrics collection
 *
 * Consumers implement this interface to integrate with their metrics system
 * (Prometheus, Datadog, New Relic, etc.)
 */
export interface MetricsPort {
  /**
   * Increment a counter metric
   *
   * @param metric - The metric name
   * @param labels - Optional labels/key-value pairs
   */
  increment(metric: string, labels?: Record<string, string>): void;

  /**
   * Record a histogram value
   *
   * @param metric - The metric name
   * @param value - The value to record
   * @param labels - Optional labels/key-value pairs
   */
  histogram(
    metric: string,
    value: number,
    labels?: Record<string, string>
  ): void;

  /**
   * Record a gauge value
   *
   * @param metric - The metric name
   * @param value - The value to record
   * @param labels - Optional labels/key-value pairs
   */
  gauge(metric: string, value: number, labels?: Record<string, string>): void;
}
