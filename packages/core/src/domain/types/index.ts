/**
 * Domain type primitives.
 *
 * Core types for domain modeling:
 *
 * - AggregateRoot - Root entity defining aggregate boundaries
 * - Brand - Type-safe branding for compile-time validation
 * - Entity - Base class for identity-based domain objects
 * - UniqueIdentifier - String or number identifier type
 * - ValueObject - Base class for attribute-based immutable objects
 */
export * from './aggregate-root';
export * from './brand.type';
export * from './entity';
export * from './unique-identifier.type';
export * from './value-object';
