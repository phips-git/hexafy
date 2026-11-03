import type { MetricsPort } from '../../../domain/ports';

export const NoOpMetricsAdapter: MetricsPort = {
  increment: () => {},
  histogram: () => {},
  gauge: () => {}
};
