# NestJS Example App

This example demonstrates how to use `@hexafy/core` and `@hexafy/nestjs` to build hexagonal architecture applications with NestJS.

## Architecture

```
┌─────────────────────────────────────┐
│         Controllers                 │
│  (src/controllers/*.ts)             │
│  • HTTP endpoints                   │
│  • Request/response handling        │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│         Domain Layer                │
│  (src/domain/usecases/*.ts)         │
│  • UseCase implementations          │
│  • Business logic                   │
│  • Entities                         │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│      Infrastructure Layer           │
│  • InMemoryUserRepository           │
│  • Database adapters (future)       │
└─────────────────────────────────────┘
```

## Example Endpoints

### Say Hello

Returns a greeting based on input.

**Endpoint**: `POST /hello`

**Request**:

```json
{
  "name": "World"
}
```

**Response** (200 OK):

```json
{
  "message": "Hello, World! Welcome to hexagonal architecture."
}
```

### Create User

Creates a new user with validation.

**Endpoint**: `POST /users`

**Request**:

```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "id": "user_1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response** (400 Bad Request):

```json
{
  "success": false,
  "error": "Name is required",
  "code": "USE_CASE_ERROR"
}
```

## Usage

### Start the Server

```bash
# Install dependencies
npm install

# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

### Test Endpoints

```bash
# Say Hello
curl -X POST http://localhost:3000/hello \
  -H "Content-Type: application/json" \
  -d '{"name": "World"}'

# Create User
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

## Key Concepts

### 1. Domain Layer

Use cases are pure business logic that extend `Usecase`:

````typescript
import {
  Usecase,
  UsecaseExecutionDependencies,
  LoggerPort
} from '@hexafy/core';
```typescript
import { Usecase, UsecaseExecutionDependencies, LoggerPort } from '@hexafy/core';

class CreateUserUseCase extends Usecase<CreateUserInput, UserCreated> {
  constructor(dependencies: UsecaseExecutionDependencies) {
    super(dependencies);
  }

  protected async executeInternal(input: CreateUserInput, logger: LoggerPort): Promise<Result<UserCreated>> {
    // Domain errors returned as failure()
    if (!input.email) {
      return failure(new UseCaseError('Email is required'));
    }

    // Business logic
    logger.info('Creating user', { email: input.email });
    return success({ userId: 'user_123' });
  }
}
````

### 2. NestJS Integration

Use `@hexafy/nestjs` to integrate with NestJS:

```typescript
import {
  createUsecaseProvider,
  DomainExceptionFilter,
  UseCaseFilter
} from '@hexafy/nestjs';
import { Module } from '@nestjs/common';

@Module({
  providers: [
    // Register use cases as providers
    createUsecaseProvider(new CreateUserUseCase()),

    // Add exception filters for automatic error handling
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
export class AppModule {}
```

### 3. Controllers

Controllers are thin wrappers that call use cases:

```typescript
import { Body, Controller, Post } from '@nestjs/common';

import { CreateUserUseCase } from '../domain/usecases/create-user.usecase';

@Controller('users')
export class UsersController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  async createUser(@Body() input: CreateUserInput) {
    const result = await this.createUserUseCase.execute(input);
    return { success: true, data: result };
  }
}
```

### 4. Exception Filters

Domain errors are automatically caught and formatted:

```typescript
// DomainExceptionFilter handles:
// - DomainError → 400 Bad Request
// - UseCaseError → 400 Bad Request

// Both return consistent error format:
{
  success: false,
  error: "Error message",
  code: "ERROR_CODE"
}
```

## Project Structure

```
src/
├── app.module.ts              # NestJS module configuration
├── main.ts                    # Application entry point
├── controllers/
│   ├── hello.controller.ts    # Hello endpoint
│   └── users.controller.ts    # User CRUD endpoints
└── domain/
    ├── usecases/
    │   ├── say-hello.usecase.ts
    │   └── create-user.usecase.ts
    └── repositories/
        └── in-memory-user.repository.ts
```

## Package Dependencies

- `@hexafy/core` - Hexagonal architecture constructs
- `@hexafy/nestjs` - NestJS adapters and helpers

## Next Steps

1. **Add a real database** - Replace `InMemoryUserRepository` with a TypeORM/Prisma repository
2. **Add authentication** - Implement JWT or session-based auth
3. **Add more use cases** - Create additional use cases for your application
4. **Add validation** - Use class-validator for request validation
5. **Add tests** - Write unit and integration tests

## See Also

- [`@hexafy/core` README](../../packages/core/README.md)
- [`@hexafy/nestjs` README](../../packages/nestjs/README.md)
