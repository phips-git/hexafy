/**
 * Base unit of work class providing default transaction implementations
 *
 * This class implements the UnitOfWork interface and provides a default
 * implementation that throws NotSupported errors as transaction support
 * varies by database technology.
 */
import { UnitOfWork } from './unit-of-work';

export abstract class UnitOfWorkBase implements UnitOfWork {
  /**
   * Commit all pending changes
   * @abstract
   */
  abstract commit(): Promise<void>;

  /**
   * Rollback all pending changes
   * @abstract
   */
  abstract rollback(): Promise<void>;

  /**
   * Execute a function within a transaction
   */
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
