/**
 * Domain ports for dependency injection.
 *
 * Provides abstractions for cross-cutting concerns:
 *
 * - ClockPort - Time/clock operations
 * - IdentifierPort - Unique ID generation
 * - LoggingPort - Structured logging
 * - MetricsPort - Metrics collection
 */
export * from './clock.port';
export * from './identifier.port';
export * from './logging.port';
export * from './metrics.port';
