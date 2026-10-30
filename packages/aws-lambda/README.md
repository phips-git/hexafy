# @hexafy/aws-lambda

AWS Lambda adapters and helpers for hexagonal architecture.

## Installation

```bash
npm install @hexafy/aws-lambda @hexafy/core
```

## What is this?

This package provides AWS Lambda-specific infrastructure for hexagonal architecture. It handles:

- Lambda handler creation from use cases
- Input parsing and validation
- Error formatting and logging
- Response formatting

## Quick Start

### Basic Handler

```typescript
import { createLambdaHandler } from '@hexafy/aws-lambda';
import { UseCaseError } from '@hexafy/core';

import { CreateUserUseCase } from './usecases/create-user';

export const handler = createLambdaHandler({
  useCase: new CreateUserUseCase(),

  // Transform API Gateway event to use case input
  inputTransformer: (event) => ({
    name: event.body?.name,
    email: event.body?.email
  }),

  // Format success response
  responseFormatter: (output) => ({
    statusCode: 201,
    body: JSON.stringify({ userId: output.userId })
  }),

  // Format error response
  errorFormatter: (error) => ({
    statusCode: error instanceof UseCaseError ? 400 : 500,
    body: JSON.stringify({ error: error.message })
  })
});
```

### Using Built-in Formatters

```typescript
import {
  createLambdaHandler,
  formatJsonResponse,
  parseJsonBody
} from '@hexafy/aws-lambda';

export const handler = createLambdaHandler({
  useCase: new CreateUserUseCase(),
  inputTransformer: parseJsonBody,
  responseFormatter: formatJsonResponse
});
```

## Core API

### `createLambdaHandler`

Creates a Lambda handler from a use case:

```typescript
createLambdaHandler<Input, Output>({
  useCase,              // Your use case instance
  inputTransformer,     // Transform event → input
  responseFormatter?,   // Transform output → response
  errorFormatter?,      // Transform error → response
  onError?,             // Optional error logging
})
```

### Input Parsing Utilities

```typescript
import {
  parseInput, // Parse all input parts
  parseJsonBody, // Parse request body as JSON
  parsePathParameters, // Parse path params
  parseQueryParameters, // Parse query params
  validateHttpMethod // Validate HTTP method
} from '@hexafy/aws-lambda';
```

### Response Formatters

```typescript
import {
  formatBadRequest, // 400 response
  formatError, // Error response
  formatForbidden, // 403 response
  formatNotFound, // 404 response
  formatSuccess, // Success response
  formatUnauthorized // 401 response
} from '@hexafy/aws-lambda';
```

### Note

The middleware module (error handling, logging) is available but optional. For v1.0.0, focus on:

- `createLambdaHandler` - Main handler creation
- Input/output parsing utilities
- Response formatting functions

## Examples

### Complete User Creation Handler

```typescript
import {
  createLambdaHandler,
  formatError,
  parseJsonBody
} from '@hexafy/aws-lambda';
import { UseCaseError } from '@hexafy/core';

export const createUserHandler = createLambdaHandler({
  useCase: new CreateUserUseCase(),
  inputTransformer: parseJsonBody,
  responseFormatter: formatError,
  errorFormatter: formatError
});
```

### Handler with Logger

```typescript
import {
  createLambdaHandler,
  formatJsonResponse,
  parseJsonBody
} from '@hexafy/aws-lambda';

import { CreateUserUseCase } from './usecases/create-user';

export const createUserHandler = createLambdaHandler({
  useCase: new CreateUserUseCase(),
  inputTransformer: parseJsonBody,
  responseFormatter: formatJsonResponse,
  errorFormatter: (error) => ({
    statusCode: 500,
    body: JSON.stringify({ error: error.message })
  }),
  onError: (error, context) => {
    logger.error('Handler error', {
      awsRequestId: context.awsRequestId
    });
  }
});
```

## Package Structure

```
@hexafy/aws-lambda
├── handler/           # createLambdaHandler, HandlerConfig
├── middleware/        # error handling, logging
└── utils/             # input parsing, response formatting
```

## Error Handling

The package uses the error hierarchy from `@hexafy/core`:

```typescript
import {
  DomainError,
  HexagonalError,
  RepositoryError,
  UseCaseError
} from '@hexafy/core';

// Handler automatically formats based on error type
export const handler = createLambdaHandler({
  useCase: new CreateUserUseCase(),
  inputTransformer: parseJsonBody
  // ...
});

// In your use case:
class CreateUserUseCase {
  async execute(input) {
    if (!input.email) {
      throw new UseCaseError('Email is required'); // → 400
    }

    // Business logic error
    throw new DomainError('User already exists'); // → 400
  }
}
```

## License

MIT
