/**
 * Unique identifier for generating IDs
 */
export type UniqueIdentifier = string | number;

/**
 * Id generator interface for generating unique identifiers
 */
export interface IdGenerator {
  /**
   * Generate a unique identifier
   */
  generateId(): string;
}
