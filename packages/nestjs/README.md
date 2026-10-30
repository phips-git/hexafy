# @hexafy/nestjs

NestJS adapters and helpers for hexagonal architecture.

## Installation

```bash
npm install @hexafy/nestjs @hexafy/core @nestjs/common
```

## What is this?

This package provides NestJS-specific infrastructure for hexagonal architecture. It handles:

- Use case registration as NestJS providers
- Exception filters for domain errors
- Module configuration for domain/infrastructure separation

## Quick Start

### Basic Module Structure

```typescript
import { createUsecaseProvider, DomainModule } from '@hexafy/nestjs';
import { Module } from '@nestjs/common';

import { CreateUserUseCase } from './usecases/create-user';

@Module({
  providers: [createUsecaseProvider(new CreateUserUseCase())]
})
export class UserModule {}
```

### With Controllers

```typescript
import { createUsecaseProvider } from '@hexafy/nestjs';
import { Body, Controller, Post } from '@nestjs/common';

import { CreateUserUseCase } from './usecases/create-user';

@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase = createUsecaseProvider(
      new CreateUserUseCase()
    )
  ) {}

  @Post()
  async create(@Body() input) {
    const result = await this.createUserUseCase.execute(input);
    return { success: true, data: result };
  }
}
```

### With Exception Filters

```typescript
import {
  DomainExceptionFilter,
  DomainModule,
  UseCaseFilter
} from '@hexafy/nestjs';
import { Module } from '@nestjs/common';

import { CreateUserUseCase } from './usecases/create-user';

@Module({
  providers: [
    createUsecaseProvider(new CreateUserUseCase()),
    {
      provide: 'APP_FILTER',
      useClass: DomainExceptionFilter
    },
    {
      provide: 'APP_FILTER',
      useClass: UseCaseFilter
    }
  ]
})
export class UserModule {}
```

## Core API

### Domain Module

Create domain modules that isolate business logic:

```typescript
import { DomainModule } from '@hexafy/nestjs';

@DomainModule({
  providers: [CreateUserUseCase, UserService, OrderService]
})
export class DomainModule {}
```

### Use Case Provider

Register use cases as injectable providers:

```typescript
import { createUsecaseProvider } from '@hexafy/nestjs';

// As a provider
@Module({
  providers: [createUsecaseProvider(new CreateUserUseCase())]
})
// Or inject it
@Injectable()
export class UserService {
  constructor(
    @InjectUseCase(CreateUserUseCase)
    private readonly useCase: CreateUserUseCase
  ) {}
}
```

### Exception Filters

Handle domain errors automatically:

```typescript
import { DomainExceptionFilter, UseCaseFilter } from '@hexafy/nestjs';

// These filters automatically convert:
// - DomainError → 400 Bad Request
// - UseCaseError → 400 Bad Request
```

## Examples

### Complete User Module

```typescript
import {
  createUsecaseProvider,
  DomainExceptionFilter,
  DomainModule,
  UseCaseFilter
} from '@hexafy/nestjs';
import { Module } from '@nestjs/common';

import { UserRepository } from './repositories/user.repository';
import { CreateUserUseCase } from './usecases/create-user';
import { UserController } from './user.controller';

@Module({
  imports: [DomainModule],
  controllers: [UserController],
  providers: [
    createUsecaseProvider(new CreateUserUseCase()),
    UserRepository,
    {
      provide: 'APP_FILTER',
      useClass: DomainExceptionFilter
    },
    {
      provide: 'APP_FILTER',
      useClass: UseCaseFilter
    }
  ]
})
export class UserModule {}
```

### Layered Architecture

```typescript
import { DomainModule as HexDomainModule } from '@hexafy/nestjs';
// src/domain.module.ts
import { Module } from '@nestjs/common';

@HexDomainModule({
  providers: [
    // Use cases
    CreateUserUseCase,
    UpdateUserUseCase,

    // Domain services
    UserService,
    OrderService
  ],
  exports: [CreateUserUseCase, UpdateUserUseCase]
})
export class DomainModule {}

import { DomainModule as HexDomainModule } from '@hexafy/nestjs';
// src/infrastructure.module.ts
import { Module } from '@nestjs/common';

@HexDomainModule({
  imports: [DomainModule],
  providers: [
    // Infrastructure
    DatabaseModule,
    ExternalApiService
  ]
})
export class InfrastructureModule {}

// src/app.module.ts
import { Module } from '@nestjs/common';

import { DomainModule } from './domain.module';
import { InfrastructureModule } from './infrastructure.module';
import { UserController } from './user.controller';

@Module({
  imports: [DomainModule, InfrastructureModule],
  controllers: [UserController]
})
export class AppModule {}
```

### With Decorators

```typescript
import { UseCaseProvider } from '@hexafy/nestjs';

@UseCaseProvider()
export class CreateUserUseCase extends Usecase {
  protected async executeInternal(input) {
    // Business logic
  }
}

// Then inject
@Injectable()
export class UserService {
  constructor(
    @InjectUseCase(CreateUserUseCase)
    private readonly useCase: CreateUserUseCase
  ) {}
}
```

## Project Structure

```
@hexafy/nestjs
├── module/            # DomainModule, InfrastructureModule
├── filters/           # DomainExceptionFilter, UseCaseFilter
└── providers/         # createUsecaseProvider
```

## Error Handling

The package uses the error hierarchy from `@hexafy/core`:

```typescript
import { DomainError, UseCaseError } from '@hexafy/core';

// Errors are thrown in use cases and automatically caught by filters:
class CreateUserUseCase extends Usecase<CreateUserInput, UserCreated> {
  protected async executeInternal(input, logger) {
    if (!input.email) {
      throw new UseCaseError('Email is required'); // → 400
    }

    throw new DomainError('User already exists'); // → 400
  }
}
```

## Best Practices

### 1. Use Domain Modules

Keep domain logic isolated:

```typescript
@DomainModule({
  providers: [
    // Pure business logic
    CreateUserUseCase,
    UserService
  ]
})
export class DomainModule {}
```

### 2. Register Use Cases as Providers

Make use cases injectable:

```typescript
@Module({
  providers: [
    createUsecaseProvider(new CreateUserUseCase())
  ]
})
```

### 3. Add Exception Filters

Handle errors globally:

```typescript
providers: [
  {
    provide: 'APP_FILTER',
    useClass: DomainExceptionFilter
  },
  {
    provide: 'APP_FILTER',
    useClass: UseCaseFilter
  }
];
```

## License

MIT
