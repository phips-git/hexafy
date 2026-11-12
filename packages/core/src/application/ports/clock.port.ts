/**
 * Port for clock/time operations.
 *
 * Provides an abstraction for time-related operations, enabling testing through
 * mock implementations and flexibility for different time sources.
 *
 * @example
 *   ```typescript
 *   // Get current timestamp
 *   const timestamp = clock.now(); // milliseconds since epoch
 *   ```;
 *
 * @returns Current time as milliseconds since Unix epoch
 */
export interface ClockPort {
  now(): number;
}
