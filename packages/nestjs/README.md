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

This package provides a complete error handling system that integrates `@hexafy/core` domain errors with HTTP-specific errors for NestJS controllers.

### Error Hierarchy

#### Domain Errors (from @hexafy/core)

```
ApplicationError
├── ValidationError
├── NotFoundError
├── ConflictError
├── UnauthorizedError
├── ForbiddenError
└── InvariantError
```

#### Adapter-Specific Errors (from @hexafy/nestjs)

```
ApplicationError (re-exported from @hexafy/core)
├── InfrastructureError          — Database, network, file system failures → HTTP 500
├── ExternalServiceError         — Third-party API failures → HTTP 500
├── InternalServerError          — Unexpected system errors → HTTP 500
├── HttpUnauthorizedError        — Missing/invalid authentication → HTTP 401
└── HttpForbiddenError           — Insufficient permissions → HTTP 403
```

### Error Classes

#### Domain Errors

All domain errors are re-exported from `@hexafy/core` and work identically:

```typescript
import { NotFoundError, ValidationError } from '@hexafy/core/domain';

class CreateUserUseCase extends Usecase<CreateUserInput, UserCreated> {
  protected async executeInternal(input, logger) {
    // Validation error → HTTP 400 Bad Request
    if (!input.email) {
      throw new ValidationError('Email is required');
    }

    // Not found error → HTTP 400 Bad Request
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    return { userId: user.id };
  }
}
```

#### Infrastructure Errors

Use these for infrastructure-layer failures in controllers or repositories:

```typescript
import { ExternalServiceError, InfrastructureError } from '@hexafy/nestjs';

class NotificationService {
  async sendNotification(to: string, message: string) {
    try {
      await this.emailProvider.send(to, message);
    } catch (error) {
      // Wrap infrastructure errors → HTTP 500 Internal Server Error
      throw new InfrastructureError('Failed to send email', {
        cause: error,
        context: { recipient: to }
      });
    }
  }

  async sendSMS(to: string, message: string) {
    try {
      await this.smsProvider.send(to, message);
    } catch (error) {
      // External service failures → HTTP 500
      throw new ExternalServiceError('SMS provider unavailable', {
        cause: error
      });
    }
  }
}
```

#### HTTP-Specific Errors

Use these for authentication/authorization failures in guards or interceptors:

```typescript
import { HttpForbiddenError, HttpUnauthorizedError } from '@hexafy/nestjs';

class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // No authentication token → HTTP 401
    if (!request.headers.authorization) {
      throw new HttpUnauthorizedError('Missing authentication token');
    }

    // Invalid token → HTTP 401
    if (!isValidToken(request.headers.authorization)) {
      throw new HttpUnauthorizedError('Invalid authentication token');
    }

    // User lacks permissions → HTTP 403
    if (!request.user.hasPermission('edit')) {
      throw new HttpForbiddenError('Insufficient permissions');
    }

    return true;
  }
}
```

### Exception Filters

Three filters handle different error types with appropriate HTTP status codes:

#### HttpExceptionFilter (HTTP 401/403)

```typescript
import {
  HttpExceptionFilter,
  HttpForbiddenError,
  HttpUnauthorizedError
} from '@hexafy/nestjs';
import { Module } from '@nestjs/common';

@Module({
  providers: [
    {
      provide: 'APP_FILTER',
      useClass: HttpExceptionFilter
    }
  ]
})
export class AuthModule {}
```

Handles:

- `HttpUnauthorizedError` → HTTP 401
- `HttpForbiddenError` → HTTP 403

Response format:

```json
{
  "success": false,
  "error": {
    "code": "HTTP_UNAUTHORIZED_ERROR",
    "message": "Invalid authentication token",
    "context": {/* optional */}
  }
}
```

#### DomainExceptionFilter (HTTP 400)

```typescript
import { DomainExceptionFilter } from '@hexafy/nestjs';
import { Module } from '@nestjs/common';

@Module({
  providers: [
    {
      provide: 'APP_FILTER',
      useClass: DomainExceptionFilter
    }
  ]
})
export class AppModule {}
```

Handles:

- All `@hexafy/core` errors (`ValidationError`, `NotFoundError`, etc.)
- Any error extending `ApplicationError` → HTTP 400

Response format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "context": {/* optional */}
  }
}
```

#### InfrastructureExceptionFilter (HTTP 500)

```typescript
import {
  InfrastructureError,
  InfrastructureExceptionFilter
} from '@hexafy/nestjs';
import { Module } from '@nestjs/common';

@Module({
  providers: [
    {
      provide: 'APP_FILTER',
      useClass: InfrastructureExceptionFilter
    }
  ]
})
export class AppModule {}
```

Handles:

- `InfrastructureError` → HTTP 500
- `ExternalServiceError` → HTTP 500
- `InternalServerError` → HTTP 500

Response format:

```json
{
  "success": false,
  "error": {
    "code": "INFRASTRUCTURE_ERROR",
    "message": "Database connection failed",
    "context": {/* optional */}
  }
}
```

### Complete Error Handling Setup

Register all filters in your main app module:

```typescript
import {
  DomainExceptionFilter,
  HttpExceptionFilter,
  InfrastructureExceptionFilter
} from '@hexafy/nestjs';
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter
    },
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter
    },
    {
      provide: APP_FILTER,
      useClass: InfrastructureExceptionFilter
    }
  ]
})
export class AppModule {}
```

### Custom Error Creation

Extend `ApplicationError` for domain-specific errors:

```typescript
import { ApplicationError, type ApplicationErrorDetails } from '@hexafy/nestjs';

class PaymentProcessingError extends ApplicationError {
  constructor(
    message = 'Payment processing failed',
    details?: ApplicationErrorDetails
  ) {
    const options = normalizeApplicationErrorDetails(details);
    super(message, { ...options, code: 'PAYMENT_PROCESSING_ERROR' });
  }
}

function normalizeApplicationErrorDetails(
  details: ApplicationErrorDetails | undefined
): { context?: Record<string, unknown>; cause?: unknown } {
  if (details === undefined) return {};
  if (
    details !== null &&
    typeof details === 'object' &&
    ('context' in details || 'cause' in details)
  ) {
    return details as { context?: Record<string, unknown>; cause?: unknown };
  }
  return { cause: details };
}

// Usage in use case
if (paymentStatus.failed) {
  throw new PaymentProcessingError('Payment declined', {
    context: { reason: 'Insufficient funds', attemptId: 'pay_123' }
  });
}
```

## Best Practices

### 1. Keep Domain Errors in Use Cases

Domain errors should be thrown in use cases and automatically converted to HTTP responses:

```typescript
class CreateUserUseCase extends Usecase<CreateUserInput, UserCreated> {
  protected async executeInternal(input) {
    // Domain errors → HTTP 400
    if (!input.email) {
      throw new ValidationError('Email is required');
    }

    return { userId: id };
  }
}
```

### 2. Use Infrastructure Errors in Repositories

Infrastructure errors should be thrown in repositories and infrastructure layers:

```typescript
class UserRepository {
  async findById(id: string) {
    try {
      return await this.db.query('SELECT * FROM users WHERE id = ?', [id]);
    } catch (error) {
      // Infrastructure errors → HTTP 500
      throw new InfrastructureError('Database query failed', { cause: error });
    }
  }
}
```

### 3. Add All Exception Filters

Register all three filters for complete error handling:

```typescript
@Module({
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
    { provide: APP_FILTER, useClass: InfrastructureExceptionFilter }
  ]
})
export class AppModule {}
```

### 4. Create Domain-Specific Errors

Extend `ApplicationError` for reusable domain errors:

```typescript
class PaymentProcessingError extends ApplicationError {
  constructor(message = 'Payment failed', details?: ApplicationErrorDetails) {
    super(message, { ...details, code: 'PAYMENT_PROCESSING_ERROR' });
  }
}
```

## License

MIT
