import { Entity as EntityType, type UniqueIdentifier } from '../types';

/**
 * Base repository class providing common CRUD operations.
 *
 * This class implements the Repository interface and can be extended to provide
 * domain-specific implementations while maintaining the core repository
 * contract. It provides default implementations for common operations like
 * `exists`, `update`, and others.
 *
 * @example
 *   ```typescript
 *   class UserRepository extends RepositoryBase<User, UserId> {
 *     async findById(id: UserId): Promise<User | null> {
 *       const data = await db.users.findOne({ id: id.value });
 *       return data ? new User(id, data.email, data.name) : null;
 *     }
 *
 *     async findAll(): Promise<User[]> {
 *       const users = await db.users.find({});
 *       return users.map((u) => new User(new UserId(u.id), u.email, u.name));
 *     }
 *
 *     async save(entity: User): Promise<User> {
 *       const data = {
 *         id: entity.id.value,
 *         email: entity.email,
 *         name: entity.name
 *       };
 *       await db.users.upsert(data);
 *       return entity;
 *     }
 *
 *     async delete(id: Id): Promise<void> {
 *       await db.users.delete({ id: id.value });
 *     }
 *   }
 *   ```
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
