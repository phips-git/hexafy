/**
 * Base unit of work class providing default transaction implementations.
 *
 * This class provides the UnitOfWork interface implementation with a default
 * transaction pattern that commits on success and rolls back on failure.
 *
 * Extending this class ensures consistent transactional behavior across all
 * operations while allowing custom commit/rollback logic per implementation.
 *
 * @example
 *   ```typescript
 *   class SqlUnitOfWork extends UnitOfWorkBase {
 *     constructor(private readonly connection: SqlConnection) {}
 *
 *     async commit(): Promise<void> {
 *       await this.connection.commit();
 *     }
 *
 *     async rollback(): Promise<void> {
 *       await this.connection.rollback();
 *     }
 *   }
 *
 *   // Usage
 *   const uw = new SqlUnitOfWork(connection);
 *   const result = await uw.transaction(async (txn) => {
 *     const user = new User(generateId());
 *     await repository.save(user);
 *     return user;
 *   });
 *   // Returns user and commits transaction
 *   ```
 */

export abstract class UnitOfWorkBase {
  /**
   * Commit all pending changes
   *
   * @abstract
   */
  abstract commit(): Promise<void>;

  /**
   * Rollback all pending changes
   *
   * @abstract
   */
  abstract rollback(): Promise<void>;

  /** Execute a function within a transaction */
  async transaction<T>(fn: (uw: UnitOfWorkBase) => Promise<T>): Promise<T> {
    try {
      const result = await fn(this);
      await this.commit();
      return result;
    } catch (error) {
      await this.rollback();
      throw error;
    }
  }
}
