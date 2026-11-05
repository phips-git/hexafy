# @hexafy/core

> **Hexagonal architecture primitives for TypeScript** — Clean, explicit, and opinionated building blocks for building maintainable applications.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)

## 🎯 What is This?

`@hexafy/core` provides the fundamental building blocks for implementing **hexagonal architecture** (also known as ports and adapters) in TypeScript applications. It gives you a consistent, battle-tested pattern for:

- **Use Cases** — Pure business logic encapsulated in reusable operations
- **Result Types** — Explicit error handling without exceptions for domain errors
- **Repositories** — Clean data access abstraction
- **Unit of Work** — Transactional boundary management
- **Logger Ports** — Optional structured logging with no-op fallback

## ✨ Why Use It?

### Problems Solved

| Problem                               | Solution                                                                                       |
| ------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Mixed exception/return error patterns | **Explicit `Result` type** — all domain errors handled consistently                            |
| Logging setup complexity              | **Built-in NOOP logger** — works immediately, opt-in to structured logging                     |
| Use case boilerplate                  | **`Usecase` base class** — handles logging, metrics, and error wrapping automatically          |
| Unclear error boundaries              | **Domain vs Infrastructure separation** — domain errors returned, infrastructure errors thrown |

### Key Benefits

- ✅ **Type-safe error handling** — No more `any` exceptions for expected failures
- ✅ **Zero-config logging** — Works out of the box, switches to NOOP when disabled
- ✅ **Consistent patterns** — Same approach across your entire codebase
- ✅ **Testing friendly** — Dependencies are optional and injectable
- ✅ **Production ready** — Automatic execution metrics and structured logging

## 📦 Installation

```bash
bun add @hexafy/core
# or
npm install @hexafy/core
# or
yarn add @hexafy/core
```

> Package consumers receive the built ESM artifacts from `dist/`. The monorepo keeps TypeScript sources in `src/` for local development and swaps the published export map at release time to the compiled output.

## 🚀 Quick Start

### Your First Use Case

```typescript
import {
  failure,
  Result,
  success,
  Usecase,
  UsecaseExecutionDependencies,
  ValidationError
} from '@hexafy/core';

interface CreateUserInput {
  email: string;
  name: string;
}

interface UserCreated {
  userId: string;
  email: string;
}

class CreateUserUseCase extends Usecase<CreateUserInput, UserCreated> {
  constructor(dependencies: UsecaseExecutionDependencies) {
    super(dependencies);
  }

  protected async executeInternal(
    input: CreateUserInput,
    logger: LoggerPort
  ): Promise<Result<UserCreated>> {
    // Domain validation — return failures, don't throw
    if (!input.email.includes('@')) {
      return failure(new ValidationError('Invalid email format'));
    }

    if (input.name.length < 2) {
      return failure(new ValidationError('Name too short'));
    }

    // Business logic
    const userId = this.dependencies.generateId?.() ?? `user_${Date.now()}`;

    logger.info('User created', { userId, email: input.email });

    return success({ userId, email: input.email });
  }
}

// Usage
const useCase = new CreateUserUseCase({});
const result = await useCase.execute({
  email: 'john@example.com',
  name: 'John'
});

if (result.success) {
  console.log(`Created user ${result.value.userId}`);
} else {
  console.error(result.error.message); // ValidationError message
}
```

## 📚 Core Concepts

### Result Type

Explicit success/failure handling for domain errors:

```typescript
import { failure, Result, success } from '@hexafy/core';

// Success path
const result = success({ data: 'value' });
if (result.success) {
  console.log(result.value.data);
}

// Failure path
const errorResult = failure(new Error('Something went wrong'));
if (!errorResult.success) {
  console.error(errorResult.error.message);
}
```

### Error Utilities

#### `isDomainError(value: unknown): value is DomainErrorLike`

Checks if a value is a domain error (has compatible shape). Works with both `@hexafy/core` errors and custom error classes.

```typescript
import { ApplicationError, isDomainError, ValidationError } from '@hexafy/core';

// Built-in errors
isDomainError(new ValidationError('Invalid input')); // true

// Custom errors with code/context
isDomainError({
  code: 'MY_ERROR',
  message: 'Something went wrong',
  context: { userId: 123 }
}); // true

// Regular Error (no code/context)
isDomainError(new Error('Generic error')); // false
```

#### `getDomainErrorCode(error: Error): string | undefined`

Extracts the error code from any error. Useful for routing errors to appropriate handlers.

```typescript
import { getDomainErrorCode, ValidationError } from '@hexafy/core';

getDomainErrorCode(new ValidationError());
// Returns: 'VALIDATION_ERROR'

getDomainErrorCode(new ApplicationError('Custom error', { code: 'CUSTOM' }));
// Returns: 'CUSTOM'

getDomainErrorCode(new Error('Generic'));
// Returns: 'UNKNOWN_ERROR' (derived from name)
```

### Logger Port

Structured logging is always available. Configure via `loggerFactory` or defaults to NOOP:

```typescript
import { consoleLogger, LoggerPort } from '@hexafy/core';

class MyUseCase extends Usecase<Input, Output> {
  protected async executeInternal(
    input: Input,
    logger: LoggerPort
  ): Promise<Result<Output>> {
    logger.debug('Starting execution', { input });
    logger.info('Success', { result: output });
    return success(output);
  }
}

// Configure with your logger
const useCase = new MyUseCase({
  loggerFactory: (name) => consoleLogger
});
```

### Error Types

Built-in error classes for domain errors. All errors support `code`, `message`, `context`, and `cause`:

| Error Type            | When to Use                            | Example                              |
| --------------------- | -------------------------------------- | ------------------------------------ |
| **ValidationError**   | Input validation fails                 | Email format invalid, required field |
| **NotFoundError**     | Resource lookup returns null/undefined | User by ID not found                 |
| **ConflictError**     | Unique constraint violation            | Email already registered             |
| **UnauthorizedError** | Authentication required                | Missing JWT token                    |
| **ForbiddenError**    | Insufficient permissions               | User can't edit another's order      |
| **InvariantError**    | Business rule violated                 | Cannot cancel order after shipment   |
| **ApplicationError**  | Generic domain error                   | Custom business logic error          |

**Note**: Infrastructure errors (database, external services) should be **thrown**, not returned. See [@hexafy/nestjs](../nestjs) for infrastructure error types.

#### Creating Custom Errors

```typescript
import { ApplicationError, type ApplicationErrorDetails } from '@hexafy/core';

class PaymentProcessingError extends ApplicationError {
  constructor(
    message = 'Payment processing failed',
    details?: ApplicationErrorDetails
  ) {
    super(message, { ...details, code: 'PAYMENT_PROCESSING_ERROR' });
  }
}
```

## 🔧 Configuration

### Logger Setup

```typescript
import Pino from 'pino';

const useCase = new CreateUserUseCase({
  loggerFactory: (name) => pinoLogger
});
```

### Dependencies

Optional dependencies injected into use cases:

```typescript
const useCase = new CreateUserUseCase({
  generateId: () => crypto.randomUUID()
});
```

## 🏗️ Quick Example

```typescript
import {
  failure,
  NotFoundError,
  Result,
  success,
  Usecase,
  ValidationError
} from '@hexafy/core';

class GetProductUseCase extends Usecase<string, Product> {
  constructor(private repository: ProductRepository) {
    super({});
  }

  protected async executeInternal(
    productId: string,
    logger: LoggerPort
  ): Promise<Result<Product>> {
    const product = await this.repository.findById(productId);

    if (!product) {
      return failure(new NotFoundError(`Product ${productId} not found`));
    }

    return success(product);
  }
}

// Usage
const useCase = new GetProductUseCase(repository);
const result = await useCase.execute('prod_123');

if (result.success) {
  console.log(result.value.name);
} else {
  console.error(result.error.message);
}
```

## 📖 API Reference

### Exports from `@hexafy/core`

| Export                                | Description                             |
| ------------------------------------- | --------------------------------------- |
| `Result<T>`, `success()`, `failure()` | Result type for explicit error handling |
| `Usecase<Input, Output>`              | Base class for use cases                |
| `UsecaseExecutionDependencies`        | Injection dependencies interface        |
| `LoggerPort`                          | Logger interface (NOOP by default)      |
| `consoleLogger`, `NOOP_LOGGER`        | Logger implementations                  |
| `Entity<T>`                           | Base entity class                       |
| `Repository<T, K>`                    | Base repository interface               |
| `UnitOfWorkBase`                      | Transactional boundary helper           |

### Error Classes

| Error Type          | Description                 |
| ------------------- | --------------------------- |
| `ValidationError`   | Invalid input data          |
| `NotFoundError`     | Resource not found          |
| `ConflictError`     | Resource conflict           |
| `UnauthorizedError` | Authentication required     |
| `ForbiddenError`    | Authorization denied        |
| `InvariantError`    | Business invariant violated |
| `ApplicationError`  | Generic domain error        |

### Utilities

| Function               | Description                       |
| ---------------------- | --------------------------------- |
| `isDomainError()`      | Type guard for domain errors      |
| `getDomainErrorCode()` | Extract error code from any error |

## 🎓 Best Practices

### Return Domain Errors, Don't Throw

Use `failure()` for expected domain errors. Throw infrastructure errors (database, external services):

```typescript
// ✅ Domain errors
if (!email.includes('@')) {
  return failure(new ValidationError('Invalid email'));
}

// ✅ Infrastructure errors
try {
  await db.save(data);
} catch (e) {
  throw new InfrastructureError('Save failed', e);
}
```

### Choose the Right Error Type

```typescript
// ✅ Use NotFoundError for missing resources
if (!user) {
  return failure(new NotFoundError('User not found'));
}

// ✅ Use ConflictError for duplicate violations
if (await this.exists(email)) {
  return failure(new ConflictError('Email already registered'));
}
```

## 🔗 Related Packages

- **[@hexafy/nestjs](../nestjs)** — NestJS adapters and infrastructure errors
- **[@hexafy/aws-lambda](../aws-lambda)** — AWS Lambda adapters

## 📄 License

MIT
