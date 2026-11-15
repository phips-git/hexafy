# @hexafy/nestjs

NestJS adapters that integrate `@hexafy/core` use cases, error contracts, and modular boundaries into Nest applications.

## Why this package exists

`@hexafy/core` stays framework-agnostic.  
`@hexafy/nestjs` provides framework-specific wiring for module setup and exception filters without moving business logic into Nest controllers.

It provides:

- domain/infrastructure module factories
- framework-facing error classes
- exception filters for HTTP mapping

## Installation

```bash
npm install @hexafy/nestjs @hexafy/core @nestjs/common @nestjs/core
# or
bun add @hexafy/nestjs @hexafy/core @nestjs/common @nestjs/core
# or
yarn add @hexafy/nestjs @hexafy/core @nestjs/common @nestjs/core
```

## Quick start

```ts
import { createDomainModule, DomainExceptionFilter } from '@hexafy/nestjs';
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

const DomainModule = createDomainModule([CreateUserUseCase]);

@Module({
  imports: [DomainModule],
  providers: [{ provide: APP_FILTER, useClass: DomainExceptionFilter }]
})
export class AppModule {}
```

## Public API at a glance

```ts
import {
  ApplicationError,
  createDomainModule,
  createInfrastructureModule,
  DomainExceptionFilter,
  DomainModule,
  ExternalServiceError,
  HttpExceptionFilter,
  HttpForbiddenError,
  HttpUnauthorizedError,
  InfrastructureError,
  InfrastructureExceptionFilter,
  InfrastructureModule,
  InternalServerError
} from '@hexafy/nestjs';
```

## Exported artifacts and usage

| Export                          | Entry point | What it is for                                          | When to use                                          | Minimal usage                                                  |
| ------------------------------- | ----------- | ------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------- |
| `createDomainModule`            | `.`         | Creates Nest modules for domain/application providers   | Isolating use cases and domain services              | `const DomainModule = createDomainModule([CreateUserUseCase])` |
| `createInfrastructureModule`    | `.`         | Creates Nest modules for infrastructure providers       | Wiring repositories/clients/adapters                 | `createInfrastructureModule([UserRepository], [DomainModule])` |
| `DomainModule`                  | `.`         | Base module decorator factory placeholder               | Custom domain module composition                     | Use as module factory/decorator primitive                      |
| `InfrastructureModule`          | `.`         | Base module decorator factory placeholder               | Custom infrastructure module composition             | Use as module factory/decorator primitive                      |
| `ApplicationError`              | `.`         | Base application error class for Nest-facing boundaries | Shared custom errors in Nest layer                   | `class X extends ApplicationError { ... }`                     |
| `InfrastructureError`           | `.`         | Infrastructure failure error type                       | Database/network/service failures                    | `throw new InfrastructureError('...')`                         |
| `ExternalServiceError`          | `.`         | Third-party dependency failure error type               | External API/provider failure mapping                | `throw new ExternalServiceError('...')`                        |
| `InternalServerError`           | `.`         | Internal unexpected failure type                        | Framework-level internal failures                    | `throw new InternalServerError()`                              |
| `HttpUnauthorizedError`         | `.`         | Explicit 401 error type                                 | Auth failures in guards/interceptors                 | `throw new HttpUnauthorizedError()`                            |
| `HttpForbiddenError`            | `.`         | Explicit 403 error type                                 | Authorization failures                               | `throw new HttpForbiddenError()`                               |
| `HttpExceptionFilter`           | `.`         | Maps HTTP auth/forbidden errors to 401/403 responses    | Global HTTP auth exception mapping                   | Register as `APP_FILTER`                                       |
| `DomainExceptionFilter`         | `.`         | Maps domain/application errors to 400 responses         | Uniform use-case validation/business error responses | Register as `APP_FILTER`                                       |
| `InfrastructureExceptionFilter` | `.`         | Maps infrastructure errors to 500 responses             | Uniform server-error boundary mapping                | Register as `APP_FILTER`                                       |

## How it fits with `@hexafy/core`

- Keep core business logic in `@hexafy/core` use cases and domain types
- Use `@hexafy/nestjs` only for Nest module wiring and HTTP exception mapping
- Do not duplicate domain contracts in Nest controllers/modules

## Recommended usage

- Keep controllers thin: input mapping + use case invocation only
- Register filters globally for consistent error responses
- Keep adapters in infrastructure modules and use-case providers in domain modules

## License

MIT
