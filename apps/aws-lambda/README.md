# AWS Lambda Example App

This example demonstrates how to use `@hex/core` and `@hex/aws-lambda` to build hexagonal architecture applications with AWS Lambda.

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

Use cases implement the `UseCase` interface from `@hex/core`:

```typescript
import { UseCase, UseCaseError } from '@hex/core';

class CreateUserUseCase implements UseCase<CreateUserInput, UserCreated> {
  async execute(input: CreateUserInput): Promise<UserCreated> {
    // Business logic here
    // Throw UseCaseError for validation failures
    // Return pure data on success
  }
}
```

### 2. Lambda Handler Creation

Handlers use `createLambdaHandler` from `@hex/aws-lambda`:

```typescript
import { createLambdaHandler, parseJsonBody } from '@hex/aws-lambda';
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
import { Repository, User } from '@hex/core';

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

- `@hex/core` - Hexagonal architecture constructs
- `@hex/aws-lambda` - AWS Lambda adapters and helpers

## Next Steps

1. **Add a real database** - Replace `InMemoryUserRepository` with a database-backed implementation
2. **Add authentication** - Implement user authentication in the handler
3. **Add more use cases** - Create additional use cases for your application
4. **Deploy** - Deploy to AWS Lambda with your preferred IaC tool

## See Also

- [`@hex/core` README](../../packages/core/README.md)
- [`@hex/aws-lambda` README](../../packages/aws-lambda/README.md)
