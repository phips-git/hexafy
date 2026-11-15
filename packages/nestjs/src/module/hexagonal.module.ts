/**
 * Hexagonal module configuration
 *
 * Provides a base module for organizing your domain, application, and
 * infrastructure layers
 */
import { Module, type ModuleMetadata, type Provider } from '@nestjs/common';

/**
 * Domain module - contains domain entities, value objects, and domain services
 *
 * Use this module for your domain logic that should be isolated from frameworks
 */
const DomainModule = Module({});

export { DomainModule };

/**
 * Infrastructure module - contains database, external services, and adapters
 *
 * Use this module for infrastructure-specific implementations
 */
const InfrastructureModule = Module({});

export { InfrastructureModule };

/**
 * Create a domain module with providers
 *
 * @example
 *   ```typescript
 *   @DomainModule({
 *     providers: [CreateUserUseCase, UserService]
 *   })
 *   export class DomainModule {}
 *   ```;
 */
export function createDomainModule(
  providers: Provider[] = [],
  imports: ModuleMetadata['imports'] = []
) {
  return Module({
    providers,
    imports,
    exports: providers
  });
}

/**
 * Create an infrastructure module with providers
 *
 * @example
 *   ```typescript
 *   @InfrastructureModule({
 *     providers: [UserRepository, DatabaseService]
 *   })
 *   export class InfrastructureModule {}
 *   ```;
 */
export function createInfrastructureModule(
  providers: Provider[] = [],
  imports: ModuleMetadata['imports'] = []
) {
  return Module({
    providers,
    imports,
    exports: providers
  });
}
