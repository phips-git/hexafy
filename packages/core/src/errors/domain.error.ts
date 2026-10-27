/**
 * Domain error base class
 *
 * Used for business logic violations, domain constraints,
 * and invalid state transitions within the domain layer
 */
import { HexagonalError } from './hexagonal.error';

export class DomainError extends HexagonalError {
  constructor(message: string) {
    super(message, 'DOMAIN_ERROR');
  }
}
