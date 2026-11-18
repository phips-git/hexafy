# @hexafy/nestjs

NestJS adapters and helpers for hexagonal architecture. Integrates `@hexafy/core` use cases with NestJS.

## Installation

```bash
bun add @hexafy/nestjs
```

## Module Helpers

Create domain and infrastructure modules for clean architecture:

```typescript
import { createDomainModule, createInfrastructureModule } from '@hexafy/nestjs';

@createDomainModule([User, CreateUseCase])
export class DomainModule {}

@createInfrastructureModule([UserRepository])
export class InfrastructureModule {}
```

## Exception Filters

Handle domain errors gracefully:

```typescript
import { DomainExceptionFilter, HttpExceptionFilter } from '@hexafy/nestjs';

const app = await NestFactory.create(AppModule);
app.useGlobalFilters(new DomainExceptionFilter(), new HttpExceptionFilter());
```

## Error Classes

All errors extend `ApplicationError` with `code`, `context`, and `cause` properties:

- `ValidationError` - Invalid input
- `NotFoundError` - Resource not found
- `ConflictError` - Resource conflicts
- `HttpUnauthorizedError` - Authentication failed
- `HttpForbiddenError` - Authorization denied
- `InternalServerError` - Unexpected failure

```typescript
import { NotFoundError, ValidationError } from '@hexafy/nestjs';

if (!email) {
  throw new ValidationError('Email is required');
}

const user = await repository.findById(id);
if (!user) {
  throw new NotFoundError(`User ${id} not found`);
}
```

## Usage Pattern

```typescript
// app.module.ts
import { Module } from '@nestjs/common';

import { DomainModule, InfrastructureModule } from './modules';

@Module({ imports: [DomainModule, InfrastructureModule] })
export class AppModule {}

import { DomainExceptionFilter } from '@hexafy/nestjs';
// main.ts
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new DomainExceptionFilter());
  await app.listen(3000);
}
```

## License

MIT
