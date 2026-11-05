import { Entity } from './entity';
import type { UniqueIdentifier } from './unique-identifier.type';

/**
 * Aggregate Root is an entity that defines a boundary within which other
 * entities (value objects and aggregates) maintain consistency.
 *
 * Aggregate roots are central to Domain-Driven Design (DDD) and enforce
 * invariants for the entire aggregate. All changes to child entities must go
 * through the aggregate root to ensure data integrity.
 *
 * @example
 *   ```typescript
 *   class Order extends AggregateRoot<OrderId> {
 *     private constructor(id: OrderId, items: OrderItem[]) {
 *       super(id);
 *       this.items = items;
 *     }
 *
 *     static create(id: OrderId, items: OrderItem[]): Order {
 *       // Validation logic here
 *       return new Order(id, items);
 *     }
 *
 *     addItem(item: OrderItem): void {
 *       this.items.push(item);
 *       this.updateTimestamp();
 *     }
 *   }
 *   ```;
 *
 * @template Id - The unique identifier type for the aggregate
 */
export abstract class AggregateRoot<
  Id extends UniqueIdentifier = UniqueIdentifier
> extends Entity<Id> {
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  protected constructor(
    id: Id,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    super(id);
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  protected updateTimestamp(): void {
    this._updatedAt = new Date();
  }
}
