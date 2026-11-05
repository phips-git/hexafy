/**
 * Base value object class for domain objects.
 *
 * Value objects are objects defined by their attributes rather than identity.
 * Two value objects with the same attributes are considered equal. Value
 * objects are immutable and used to model concepts that don't have identity.
 *
 * @example
 *   ```typescript
 *   class Money extends ValueObject {
 *     constructor(
 *       public readonly amount: number,
 *       public readonly currency: string
 *     ) {
 *       super();
 *       if (amount < 0) {
 *         throw new ValidationError('Amount cannot be negative');
 *       }
 *     }
 *
 *     equals(other: Money): boolean {
 *       return (
 *         this.amount === other.amount && this.currency === other.currency
 *       );
 *     }
 *
 *     add(other: Money): Money {
 *       if (this.currency !== other.currency) {
 *         throw new ValidationError('Cannot add different currencies');
 *       }
 *       return new Money(this.amount + other.amount, this.currency);
 *     }
 *   }
 *   ```;
 */
export abstract class ValueObject {
  abstract toJSON(): Record<string, unknown>;
}
