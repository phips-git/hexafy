import type { UniqueIdentifier } from '../types';
import type { ClockPort } from './clock.port';

export interface IdentifierPort {
  generate(clock?: ClockPort): UniqueIdentifier;
}
