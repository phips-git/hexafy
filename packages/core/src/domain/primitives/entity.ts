import type { UniqueIdentifier } from './unique-identifier.type';

/**
 * Base entity class for domain objects.
 *
 * Entities are objects defined by their identity rather than their attributes.
 * Two entities with the same ID are considered equal, even if their properties
 * differ. Entities are the building blocks of domain models.
 *
 * @example
 *   ```typescript
 *   class User extends Entity<UserId> {
 *     constructor(
 *       id: UserId,
 *       public email: string,
 *       public name: string
 *     ) {
 *       super(id);
 *     }
 *
 *     equals(other: User): boolean {
 *       return this.id === other.id;
 *     }
 *   }
 *   ```;
 *
 * @template Id - The unique identifier type for the entity
 */
export abstract class Entity<Id extends UniqueIdentifier = UniqueIdentifier> {
  private readonly _id: Id;

  protected constructor(id: Id) {
    this._id = id;
  }

  getId(): Id {
    return this._id;
  }

  abstract toJSON(): Record<string, unknown>;
}
