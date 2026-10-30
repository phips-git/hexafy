import { UniqueIdentifier } from './unique-identifier.type';

/** Entity base class Represents a domain object with a unique identity */
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
