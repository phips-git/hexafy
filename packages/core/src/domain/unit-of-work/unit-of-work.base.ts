/**
 * Base unit of work class providing default transaction implementations
 *
 * This class provides the UnitOfWork interface implementation with a default
 * transaction pattern that commits on success and rolls back on failure.
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
