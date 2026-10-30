# AWS Lambda Example App

This example demonstrates how to use `@hexafy/core` and `@hexafy/aws-lambda` to build hexagonal architecture applications with AWS Lambda.

## Architecture

```
┌─────────────────────────────────────┐
│          Lambda Handlers            │
│  (src/lambda/*.ts)                  │
│  • createLambdaHandler              │
│  • Input transformation             │
│  • Error formatting                 │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│         Domain Layer                │
│  (src/domain/usecases/*.ts)         │
│  • UseCase implementations          │
│  • Business logic                   │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│      Infrastructure Layer           │
│  • InMemoryUserRepository           │
│  • Database adapters (future)       │
└─────────────────────────────────────┘
```

## Example Handlers

### Say Hello

A simple use case that returns a greeting.

**Handler**: `src/lambda/say-hello.ts`

**Input**:

```json
{
  "name": "World"
}
```

**Output**:

```json
{
  "message": "Hello, World! Welcome to hexagonal architecture."
}
```

### Create User

A more complex use case with validation and persistence.

**Handler**: `src/lambda/create-user.ts`

**Input**:

```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Output**:

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

## Usage

### Local Development

```bash
# Install dependencies
npm install

# Type check
npm run typecheck

# Build
npm run build
```

### Deploy

The handlers are built to the `dist` folder:

```
dist/
├── say-hello.js
└── create-user.js
```

Use your preferred deployment method (AWS CDK, Serverless Framework, SAM, etc.) to deploy these functions.

## Key Concepts

### 1. UseCase Implementation

Use cases implement the `UseCase` interface from `@hexafy/core`:

````typescript
import {
  Usecase,
  UsecaseExecutionDependencies,
  LoggerPort
} from '@hexafy/core';
```typescript
import { Usecase, UsecaseExecutionDependencies, LoggerPort, Result } from '@hexafy/core';

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

### 2. Lambda Handler Creation

Handlers use `createLambdaHandler` from `@hexafy/aws-lambda`:

```typescript
import { createLambdaHandler, parseJsonBody } from '@hexafy/aws-lambda';

import { CreateUserUseCase } from './usecases/create-user';

export const handler = createLambdaHandler({
  useCase: new CreateUserUseCase(),
  inputTransformer: parseJsonBody,
  responseFormatter: (output) => ({
    statusCode: 201,
    body: JSON.stringify({ success: true, data: output })
  }),
  errorFormatter: (error) => ({
    statusCode: 400,
    body: JSON.stringify({ success: false, error: error.message })
  })
});
```

### 3. Repository Pattern

Repositories implement the `Repository` interface:

```typescript
import { Repository, User } from '@hexafy/core';

class InMemoryUserRepository extends Repository<User, string> {
  async findById(id: string): Promise<User | null> {
    // Find by ID
  }

  async findAll(): Promise<User[]> {
    // Find all
  }

  async save(entity: User): Promise<User> {
    // Save or update
  }

  async delete(id: string): Promise<void> {
    // Delete
  }
}
```

## Package Dependencies

- `@hexafy/core` - Hexagonal architecture constructs
- `@hexafy/aws-lambda` - AWS Lambda adapters and helpers

## Next Steps

1. **Add a real database** - Replace `InMemoryUserRepository` with a database-backed implementation
2. **Add authentication** - Implement user authentication in the handler
3. **Add more use cases** - Create additional use cases for your application
4. **Deploy** - Deploy to AWS Lambda with your preferred IaC tool

## See Also

- [`@hexafy/core` README](../../packages/core/README.md)
- [`@hexafy/aws-lambda` README](../../packages/aws-lambda/README.md)
