import type { ClockPort } from '../../../domain/ports';

export const SystemClockAdapter: ClockPort = {
  now: () => Date.now()
};
