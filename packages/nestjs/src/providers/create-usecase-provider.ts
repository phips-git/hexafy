/**
 * Create a provider configuration for a use case
 *
 * This makes use cases injectable in NestJS DI
 */
import { UseCase } from '@hex/core';

export interface UseCaseProviderConfig<T extends UseCase = UseCase> {
  use: T;
  inject?: any[];
}

/**
 * Create a use case provider
 *
 * @example
 * ```typescript
 * @Module({
 *   providers: [
 *     createUsecaseProvider(CreateUserUseCase)
 *   ]
 * })
 * export class UserModule {}
 * ```
 */
export function createUsecaseProvider<T extends UseCase>(
  useCase: T
): UseCaseProviderConfig<T> {
  return {
    use: useCase,
  };
}

/**
 * Register a use case as a provider
 *
 * @example
 * ```typescript
 * @Module({
 *   providers: [
 *     UseCaseProvider(CreateUserUseCase)
 *   ]
 * })
 * export class UserModule {}
 * ```
 */
export function UseCaseProvider<T extends UseCase>(
  useCase: T
): UseCaseProviderConfig<T> {
  return {
    use: useCase,
  };
}
