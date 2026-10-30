import { ClockPort, IdentifierPort } from '../../../domain/ports';

export const SystemIdentifierAdapter: IdentifierPort = {
  generate: (clock: ClockPort) => {
    return typeof crypto !== 'undefined' &&
      typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${clock.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
};
