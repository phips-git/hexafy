/**
 * Hexagonal module configuration
 *
 * Provides a base module for organizing your domain, application, and infrastructure layers
 */
import { Module } from '@nestjs/common';

/**
 * Domain module - contains domain entities, value objects, and domain services
 *
 * Use this module for your domain logic that should be isolated from frameworks
 */
export const DomainModule = Module({
  global: false,
});

/**
 * Infrastructure module - contains database, external services, and adapters
 *
 * Use this module for infrastructure-specific implementations
 */
export const InfrastructureModule = Module({
  global: false,
});

/**
 * Create a domain module with providers
 *
 * @example
 * ```typescript
 * @DomainModule({
 *   providers: [
 *     CreateUserUseCase,
 *     UserService
 *   ]
 * })
 * export class DomainModule {}
 * ```
 */
export function createDomainModule(
  providers: any[] = [],
  imports: any[] = []
) {
  return Module({
    providers,
    imports,
    exports: providers,
  });
}

/**
 * Create an infrastructure module with providers
 *
 * @example
 * ```typescript
 * @InfrastructureModule({
 *   providers: [
 *     UserRepository,
 *     DatabaseService
 *   ]
 * })
 * export class InfrastructureModule {}
 * ```
 */
export function createInfrastructureModule(
  providers: any[] = [],
  imports: any[] = []
) {
  return Module({
    providers,
    imports,
    exports: providers,
  });
}
