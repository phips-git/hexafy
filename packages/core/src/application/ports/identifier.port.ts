import type { UniqueIdentifier } from '../../domain/primitives';
import type { ClockPort } from './clock.port';

/** Identifier generation port. */
export interface IdentifierPort {
  /** Generates a unique identifier, optionally using the provided clock. */
  generate(clock?: ClockPort): UniqueIdentifier;
}
