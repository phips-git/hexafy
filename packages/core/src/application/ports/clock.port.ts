/** Clock abstraction for time-based behavior. */
export interface ClockPort {
  /** Returns the current time in milliseconds since the Unix epoch. */
  now(): number;
}
