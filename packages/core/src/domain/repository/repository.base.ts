import { Entity as EntityType, UniqueIdentifier } from '../types';

/**
 * Base repository class providing common CRUD operations
 *
 * This class implements the Repository interface and can be extended to provide
 * domain-specific implementations while maintaining the core repository
 * contract.
 *
 * @template Entity - The entity type managed by this repository
 * @template Id - The unique identifier type for the entity
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
