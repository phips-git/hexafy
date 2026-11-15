/**
 * Base value object.
 *
 * A value object is defined by its data rather than by identity and should be
 * immutable for domain consistency.
 */
export abstract class ValueObject {
  abstract toJSON(): Record<string, unknown>;
}
