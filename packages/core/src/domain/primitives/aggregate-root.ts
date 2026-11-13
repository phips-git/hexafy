import { Entity } from './entity';
import type { UniqueIdentifier } from './unique-identifier.type';

/**
 * Base aggregate root.
 *
 * Aggregate roots enforce consistency for the entities and value objects they
 * own and are the primary boundary for mutation.
 *
 * @template Id Aggregate identifier type.
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
