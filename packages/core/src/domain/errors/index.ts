/**
 * Domain error types.
 *
 * Provides standardized error classes for application boundaries:
 *
 * - ApplicationError - Base error for all application errors
 * - ValidationError - Validation failures
 * - NotFoundError - Resource not found
 * - ConflictError - Resource conflicts
 * - UnauthorizedError - Authentication failures
 * - ForbiddenError - Authorization failures
 * - InvariantError - Business invariant violations
 * - InfrastructureError - External system failures
 * - ExternalServiceError - Third-party API failures
 * - InternalServerError - Unexpected system failures
 */
export * from './application.error';
export * from './domain-error.guard';
