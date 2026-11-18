import { Module, type ModuleMetadata, type Provider } from '@nestjs/common';

/**
 * Decorator for domain modules.
 *
 * Use this decorator on your class to mark it as a domain module that contains
 * domain entities, value objects, and domain services. This keeps your domain
 * logic isolated from framework concerns.
 *
 * @example
 *   ```typescript
 *   @DomainModule({
 *     providers: [User, Project, Tenant]
 *   })
 *   export class DomainModule {}
 *   ```;
 */
export const DomainModule = Module({});

/**
 * Decorator for infrastructure modules.
 *
 * Use this decorator on your class to mark it as an infrastructure module that
 * contains database connections, external services, and adapters. This keeps
 * your infrastructure concerns separated from domain and application logic.
 *
 * @example
 *   ```typescript
 *   @InfrastructureModule({
 *     providers: [UserRepository, DatabaseClient]
 *   })
 *   export class InfrastructureModule {}
 *   ```;
 */
export const InfrastructureModule = Module({});

/**
 * Creates a domain module with providers and exports.
 *
 * Use this function when you need to programmatically configure a domain module
 * with specific providers. Domain modules should contain pure domain logic
 * without framework dependencies.
 *
 * @example
 *   ```typescript
 *   const domainModule = createDomainModule(
 *     [User, Project, Tenant],
 *     []
 *   );
 *   ```;
 *
 * @param providers - Array of providers to register in the domain module
 * @param imports - Optional array of imported modules
 * @returns A configured NestJS module
 */
export function createDomainModule(
  providers: Provider[] = [],
  imports: ModuleMetadata['imports'] = []
): typeof DomainModule {
  return Module({
    providers,
    imports,
    exports: providers
  });
}

/**
 * Creates an infrastructure module with providers and exports.
 *
 * Use this function when you need to programmatically configure an
 * infrastructure module with specific providers. Infrastructure modules should
 * contain all external service integrations and persistence logic.
 *
 * @example
 *   ```typescript
 *   const infraModule = createInfrastructureModule(
 *     [UserRepository, DatabaseClient, EmailService]
 *   );
 *   ```;
 *
 * @param providers - Array of providers to register in the infrastructure
 *   module
 * @param imports - Optional array of imported modules
 * @returns A configured NestJS module
 */
export function createInfrastructureModule(
  providers: Provider[] = [],
  imports: ModuleMetadata['imports'] = []
): typeof InfrastructureModule {
  return Module({
    providers,
    imports,
    exports: providers
  });
}
