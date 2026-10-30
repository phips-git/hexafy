import { ClockPort } from '../../../domain/ports';

export const SystemClockAdapter: ClockPort = {
  now: () => Date.now()
};
