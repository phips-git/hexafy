/**
 * Base error class for all errors in the hexagonal architecture
 *
 * This provides a consistent error hierarchy and metadata
 */
export class HexagonalError extends Error {
  readonly code: string;
  readonly timestamp: Date;

  constructor(message: string, code: string = 'UNKNOWN_ERROR') {
    super(message);
    this.code = code;
    this.timestamp = new Date();
    this.name = this.constructor.name;
  }
}
