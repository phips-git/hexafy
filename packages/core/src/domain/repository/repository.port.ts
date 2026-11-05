/**
 * Port for repository-based data access.
 *
 * Defines the contract for data persistence operations following the Repository
 * pattern. Provides abstraction over data sources and enables domain logic to
 * remain decoupled from infrastructure concerns.
 *
 * @example
 *   ```typescript
 *   // Implement for a specific entity
 *   class UserRepository implements RepositoryPort<User, UserId> {
 *     async findById(id: UserId): Promise<User | null> {
 *       const data = await db.users.findOne({ id: id.value });
 *       return data ? new User(id, data.email, data.name) : null;
 *     }
 *
 *     async findAll(): Promise<User[]> {
 *       return db.users.find({}).map((u) => new User(u.id, u.email, u.name));
 *     }
 *
 *     async save(entity: User): Promise<User> {
 *       await db.users.upsert(entity.toJSON());
 *       return entity;
 *     }
 *
 *     async delete(id: UserId): Promise<void> {
 *       await db.users.delete({ id: id.value });
 *     }
 *   }
 *   ```
 *
 * @template Entity - The entity type managed by this repository
 * @template UniqueIdentifier - The unique identifier type for the entity
 */
export interface RepositoryPort<Entity, UniqueIdentifier> {
  /**
   * Find an entity by its unique identifier
   *
   * @param id - The entity's unique identifier
   * @returns Promise resolving to the entity or null if not found
   */
  findById(id: UniqueIdentifier): Promise<Entity | null>;

  /**
   * Find all entities (basic CRUD - no pagination or filtering)
   *
   * For query operations with filters, pagination, and sorting, implement
   * additional methods or use a separate query repository
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
  delete(id: UniqueIdentifier): Promise<void>;
}
