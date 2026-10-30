import { UniqueIdentifier } from '../types';
import { ClockPort } from './clock.port';

export interface IdentifierPort {
  generate(clock?: ClockPort): UniqueIdentifier;
}
