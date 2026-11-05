import type { UniqueIdentifier } from '../primitives';
import type { ClockPort } from './clock.port';

/**
 * Port for generating unique identifiers.
 *
 * Provides an abstraction for identifier generation, enabling testing through
 * mock implementations and flexibility for different ID strategies (UUIDs,
 * ULIDs, timestamps, etc.).
 *
 * @example
 *   ```typescript
 *   // Generate a unique identifier
 *   const id = identifier.generate(clock);
 *   // 'a1b2c3d4e5f6g7h8'
 *   ```;
 *
 * @param clock - Optional clock port for time-based generation
 * @returns A unique identifier string
 */
export interface IdentifierPort {
  generate(clock?: ClockPort): UniqueIdentifier;
}
