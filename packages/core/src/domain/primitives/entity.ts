import type { UniqueIdentifier } from './unique-identifier.type';

/**
 * Base entity type.
 *
 * Entities are defined by identity rather than by attribute equality.
 *
 * @template Id Entity identifier type.
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
