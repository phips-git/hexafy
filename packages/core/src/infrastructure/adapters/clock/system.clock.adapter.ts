import type { ClockPort } from '../../../application/ports';

export const SystemClockAdapter: ClockPort = {
  now: () => Date.now()
};
