/**
 * Branded type helper for stronger domain typing.
 *
 * @template T Underlying type.
 * @template B Brand name.
 */
declare const brandKey: unique symbol;

export type Brand<T, B extends string> = T & { readonly [brandKey]: B };
