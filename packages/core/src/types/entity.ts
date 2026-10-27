/**
 * Entity base class
 * Represents a domain object with a unique identity
 */
export abstract class Entity<Id extends UniqueIdentifier = UniqueIdentifier> {
  private readonly _id: Id;

  protected constructor(id: Id) {
    this._id = id;
  }

  /**
   * Get the unique identifier of this entity
   */
  getId(): Id {
    return this._id;
  }

  /**
   * Check if two entities are the same by comparing IDs
   */
  equals(other: Entity): boolean {
    if (other === null || other === undefined) {
      return false;
    }

    return this._id === other._id;
  }

  /**
   * Get a plain object representation of this entity
   */
  abstract toJSON(): Record<string, unknown>;
}
