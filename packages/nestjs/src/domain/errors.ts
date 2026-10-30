/**
 * Base class for application errors. Consumers can extend this for
 * domain-specific error handling.
 */
export class ApplicationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApplicationError';
  }
}
