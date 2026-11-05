import type { MetricsPort } from '../../../domain/ports';

/**
 * No-op metrics adapter implementing MetricsPort.
 *
 * Discards all metric data. Useful for:
 *
 * - Production environments with external metrics collection
 * - Testing where metrics should not be recorded
 * - Development without metrics instrumentation
 *
 * @see {@link MetricsPort}
 */
export const NoOpMetricsAdapter: MetricsPort = {
  increment: () => {},
  histogram: () => {},
  gauge: () => {}
};
