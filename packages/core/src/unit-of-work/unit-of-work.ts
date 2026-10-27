/**
 * Unit of Work interface for transaction management
 *
 * This abstraction allows for database transactions across multiple repositories
 * without coupling to specific database implementations
 *
 * Unit of Work maintains consistency across multiple repositories by ensuring
 * all operations succeed or all are rolled back
 */
export interface UnitOfWork {
  /**
   * Commit all pending changes to the database
   *
   * If any operation fails, the transaction is rolled back
   *
   * @throws {Error} If commit fails
   */
  commit(): Promise<void>;

  /**
   * Rollback all pending changes
   *
   * This should be called if an operation fails or you want to
   * discard all changes made within the current transaction
   */
  rollback(): Promise<void>;

  /**
   * Execute a function within a transaction
   *
   * This is the preferred way to perform database operations that
   * need to be atomic (all succeed or all fail)
   *
   * @template T - The return type of the function
   * @param fn - Function to execute within transaction
   * @returns Promise resolving to the function's return value
   * @throws {Error} If the function throws or commit fails
   */
  transaction<T>(fn: (uw: UnitOfWork) => Promise<T>): Promise<T>;
}
