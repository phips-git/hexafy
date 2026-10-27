/**
 * Use case error base class
 *
 * Used for errors that occur during use case execution
 * such as validation failures, business rule violations
 * that prevent the use case from completing
 */
import { HexagonalError } from './hexagonal.error';

export class UseCaseError extends HexagonalError {
  constructor(message: string) {
    super(message, 'USE_CASE_ERROR');
  }
}
