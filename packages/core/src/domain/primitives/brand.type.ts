/**
 * Brand type for type-safe type narrowing.
 *
 * Creates a branded type that is not assignable to the base type, enabling
 * compile-time validation of type correctness.
 *
 * @example
 *   ```typescript
 *   type UserId = Brand<string, 'UserId'>;
 *   type OrderId = Brand<string, 'OrderId'>;
 *
 *   // Type-safe usage
 *   function createUser(id: UserId): void {
 *     // id is guaranteed to be a UserId
 *   }
 *
 *   // Error: cannot use plain string
 *   createUser('123' as UserId); // ❌ Error
 *   createUser('123' as UserId); // ✅ Correct
 *   ```;
 *
 * @template T - The underlying type to brand
 * @template B - The brand name (string literal)
 */
declare const brandKey: unique symbol;

export type Brand<T, B extends string> = T & { readonly [brandKey]: B };
