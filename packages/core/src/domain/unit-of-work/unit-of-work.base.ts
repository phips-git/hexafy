/**
 * Base transaction helper.
 *
 * Commits on success and rolls back on failure for any subclass that defines
 * the storage-specific `commit()` and `rollback()` methods.
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
