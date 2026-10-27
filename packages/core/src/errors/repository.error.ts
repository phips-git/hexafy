/**
 * Repository error base class
 *
 * Used for database operations failures, repository-level errors,
 * and infrastructure-related issues when accessing data
 */
import { HexagonalError } from './hexagonal.error';

export class RepositoryError extends HexagonalError {
  constructor(message: string, public readonly cause?: Error) {
    super(message, 'REPOSITORY_ERROR');
  }
}
