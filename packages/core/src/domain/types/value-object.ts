/**
 * Value Object represents a domain object with no identity Value objects are
 * defined by their attributes and are immutable
 */
export abstract class ValueObject {
  abstract toJSON(): Record<string, unknown>;
}
