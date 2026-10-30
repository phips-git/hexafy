/**
 * Base unit of work class providing default transaction implementations
 *
 * This class provides the UnitOfWork interface implementation with a default
 * transaction pattern that commits on success and rolls back on failure.
 */
export class UnitOfWorkBase {
  /** Execute a function within a transaction */
  async transaction(fn) {
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
