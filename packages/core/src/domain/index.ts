/**
 * Domain layer exports.
 *
 * Contains core domain primitives for hexagonal architecture:
 *
 * - Error types (ApplicationError, ValidationError, NotFoundError, etc.)
 * - Domain ports (ClockPort, IdentifierPort, LoggingPort, MetricsPort)
 * - Repository pattern (RepositoryPort, RepositoryBase)
 * - Domain types (Entity, ValueObject, AggregateRoot)
 * - Unit of Work pattern (UnitOfWorkBase)
 */
export * from './errors';
export * from './ports';
export * from './repository';
export * from './types';
export * from './unit-of-work';
