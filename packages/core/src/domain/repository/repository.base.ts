import { Entity as EntityType, type UniqueIdentifier } from '../primitives';

/**
 * Base repository with common CRUD helpers.
 *
 * Subclasses provide the persistence-specific implementation while inheriting
 * `exists()` and `update()` convenience methods.
 *
 * @template Entity Managed entity type.
 * @template Id Entity identifier type.
 */
export abstract class RepositoryBase<
  Entity extends EntityType<UniqueIdentifier>,
  Id extends UniqueIdentifier = UniqueIdentifier
> {
  /**
   * Find an entity by its unique identifier
   *
   * @abstract
   */
  abstract findById(id: Id): Promise<Entity | null>;

  /**
   * Find all entities
   *
   * @abstract
   */
  abstract findAll(): Promise<Entity[]>;

  /**
   * Save an entity (create or update)
   *
   * @abstract
   */
  abstract save(entity: Entity): Promise<Entity>;

  /**
   * Delete an entity by its unique identifier
   *
   * @abstract
   */
  abstract delete(id: Id): Promise<void>;

  /** Check if an entity exists by its identifier */
  async exists(id: Id): Promise<boolean> {
    const entity = await this.findById(id);
    return entity !== null;
  }

  /** Update an entity (alias for save with type safety) */
  async update(entity: Entity): Promise<Entity> {
    return this.save(entity);
  }
}
