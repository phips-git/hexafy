/**
 * Unique identifier type for domain objects.
 *
 * Represents an identifier that uniquely identifies an entity, value object, or
 * aggregate. Can be either a string (e.g., UUID) or number (e.g.,
 * auto-increment ID).
 *
 * @example
 *   ```typescript
 *   // Using branded types for stronger typing
 *   type UserId = Brand<UniqueIdentifier, 'UserId'>;
 *   type OrderId = Brand<UniqueIdentifier, 'OrderId'>;
 *
 *   // Type-safe function
 *   function getUser(id: UserId): User | null {
 *     return db.users.find(id);
 *   }
 *   ```
 */
export type UniqueIdentifier = string | number;
