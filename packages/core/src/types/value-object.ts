/**
 * Value Object represents a domain object with no identity
 * Value objects are defined by their attributes and are immutable
 */
export abstract class ValueObject {
  /**
   * Check if two value objects are equal
   */
  abstract equals(other: ValueObject): boolean;

  /**
   * Get a plain object representation of this value object
   */
  abstract toJSON(): Record<string, unknown>;
}
