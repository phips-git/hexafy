/**
 * Aggregate Root is an entity that defines a boundary within which
 * other entities (value objects and aggregates) maintain consistency
 */
import { Entity, UniqueIdentifier } from './entity';

export abstract class AggregateRoot<
  Id extends UniqueIdentifier = UniqueIdentifier
> extends Entity<Id> {
  private readonly _version: number;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  protected constructor(
    id: Id,
    version: number = 1,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    super(id);
    this._version = version;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  /**
   * Get the current version of this aggregate
   */
  getVersion(): number {
    return this._version;
  }

  /**
   * Get the creation timestamp
   */
  get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * Get the last update timestamp
   */
  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Increment the version number
   * Call this method after making changes to the aggregate
   */
  protected incrementVersion(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any)._version++;
  }

  /**
   * Update the modification timestamp
   */
  protected updateTimestamp(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any)._updatedAt = new Date();
  }
}
