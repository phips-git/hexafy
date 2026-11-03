/**
 * Repository pattern implementation.
 *
 * Provides the repository base class and port interface for data persistence:
 *
 * - RepositoryPort - Interface defining CRUD contract
 * - RepositoryBase - Abstract base with default implementations
 */
export { RepositoryBase } from './repository.base';
export type { RepositoryPort } from './repository.port';
