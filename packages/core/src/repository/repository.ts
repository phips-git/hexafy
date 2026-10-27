/**
 * Repository defines the CRUD operations for entities
 *
 * This interface is framework-agnostic and focuses on domain operations
 * only. Infrastructure-specific operations (pagination, filtering) should
 * be implemented as separate query objects or repository methods.
 *
 * @template Entity - The entity type managed by this repository
 * @template Id - The unique identifier type for the entity
 */
export interface Repository<
  Entity,
  Id extends string | number = string | number
> {
  /**
   * Find an entity by its unique identifier
   *
   * @param id - The entity's unique identifier
   * @returns Promise resolving to the entity or null if not found
   */
  findById(id: Id): Promise<Entity | null>;

  /**
   * Find all entities (basic CRUD - no pagination or filtering)
   *
   * For query operations with filters, pagination, and sorting,
   * implement additional methods or use a separate query repository
   *
   * @returns Promise resolving to array of all entities
   */
  findAll(): Promise<Entity[]>;

  /**
   * Save an entity (create or update)
   *
   * @param entity - The entity to save
   * @returns Promise resolving to the saved entity (with updated fields)
   */
  save(entity: Entity): Promise<Entity>;

  /**
   * Delete an entity by its unique identifier
   *
   * @param id - The entity's unique identifier
   * @returns Promise that resolves when the entity is deleted
   */
  delete(id: Id): Promise<void>;
}
