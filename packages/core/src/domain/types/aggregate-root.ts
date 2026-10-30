import { Entity } from './entity';
import { UniqueIdentifier } from './unique-identifier.type';

/**
 * Aggregate Root is an entity that defines a boundary within which other
 * entities (value objects and aggregates) maintain consistency
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
