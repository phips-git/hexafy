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

### 1. Result Type

Explicit success/failure handling without exceptions for domain errors.

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

// Type inference works automatically
const typed: Result<User> = success(user);
```

### 2. Use Case Base Class

Extend `Usecase<Input, Output>` to implement business logic.

#### Basic Pattern

```typescript
class UseCase extends Usecase<Input, Output> {
  protected async executeInternal(
    input: Input,
    logger: LoggerPort
  ): Promise<Result<Output>> {
    // Your business logic here
    return success(output);
  }
}
```

#### With Dependencies

```typescript
class UseCase extends Usecase<Input, Output> {
  constructor(deps: UsecaseExecutionDependencies) {
    super(deps);
  }

  protected async executeInternal(
    input: Input,
    logger: LoggerPort
  ): Promise<Result<Output>> {
    // Access dependencies if provided
    const id = this.dependencies.generateId?.() ?? crypto.randomUUID();
    return success({ id });
  }
}
```

#### Error Handling

```typescript
protected async executeInternal(
  input: Input,
  logger: LoggerPort
): Promise<Result<Output>> {
  // ✅ Domain errors — return via failure()
  if (!input.valid) {
    return failure(new ValidationError('Invalid input'));
  }

  // ✅ Infrastructure errors — throw for unexpected failures
  try {
    await this.repository.save(input);
  } catch (e) {
    throw new InfrastructureError('Save failed', e);
  }

  return success({ result: 'done' });
}
```

#### Execution Flow

```
useCase.execute(input)
  ↓
Usecase.execute() — logs start, captures duration
  ↓
executeInternal(input, logger) — your business logic
  ↓
Result<Output> returned
  ↓
Usecase.execute() — logs completion or error
```

### 3. Error Types

#### Error Hierarchy

```
HexagonalError (base)
├── DomainError
│   ├── ValidationError        — Invalid input data
│   ├── NotFoundError          — Resource not found
│   ├── ConflictError          — Resource conflict
│   ├── ForbiddenError         — Access denied
│   ├── UnauthorizedError      — Authentication required
│   ├── InvariantError         — Business invariant violated
│   ├── ExternalServiceError   — External dependency failure
│   ├── InternalServerError    — Internal business error
│   ├── TimeoutError           — Operation timed out
│   ├── RateLimitError         — Rate limit exceeded
│   └── ServiceUnavailableError — Service unavailable
├── UseCaseError              — Use case specific errors
└── InfrastructureError       — Infrastructure failures (DB, network, etc.)
```

#### When to Use Each

| Error Type              | When to Throw/Return       | Example                       |
| ----------------------- | -------------------------- | ----------------------------- |
| **DomainError** (all)   | Return via `failure()`     | Invalid email, user not found |
| **ValidationError**     | Return via `failure()`     | Input validation fails        |
| **NotFoundError**       | Return via `failure()`     | Resource lookup returns null  |
| **InfrastructureError** | Throw in try/catch         | Database connection failed    |
| **Any other error**     | Throw (caught and wrapped) | Unexpected exceptions         |

#### Logging Behavior

| Scenario                         | Log Level | Handled By  | Purpose                  |
| -------------------------------- | --------- | ----------- | ------------------------ |
| `failure()` in `executeInternal` | DEBUG     | Automatic   | Expected domain failures |
| `throw` infrastructure error     | ERROR     | Catch block | System issues            |
| Unexpected exception             | ERROR     | Catch block | Investigate              |

### 4. Logger Port

Logger is always available — configured via `loggerFactory` or defaults to NOOP.

```typescript
import { consoleLogger, LoggerPort, NOOP_LOGGER } from '@hexafy/core';

// Usage in use case
class MyUseCase extends Usecase<Input, Output> {
  protected async executeInternal(
    input: Input,
    logger: LoggerPort // Always available, never null
  ): Promise<Result<Output>> {
    logger.debug('Starting execution', { input });

    // ... logic ...

    logger.info('Success', { result: output });
    return success(output);
  }
}

// Configuration with logging
const useCase = new MyUseCase({
  loggerFactory: (name) => consoleLogger
});

// Without logging (NOOP by default)
const silentUseCase = new MyUseCase({});
```

#### Logger Methods

```typescript
logger.debug(message: string, data?: Record<string, unknown>): void
logger.info(message: string, data?: Record<string, unknown>): void
logger.warn(message: string, data?: Record<string, unknown>): void
logger.error(message: string, data?: Record<string, unknown>): void
```

### 5. Repositories

Abstract data access with type-safe entity management.

```typescript
import { Entity, Repository } from '@hexafy/core';

// Define entity
class User extends Entity<string> {
  constructor(
    id: string,
    public email: string,
    public name: string
  ) {
    super(id);
  }
}

// Define repository
class UserRepository extends Repository<User, string> {
  constructor(private db: Database) {
    super();
  }

  async findById(id: string): Promise<User | null> {
    const row = await db.users.get(id);
    return row ? new User(row.id, row.email, row.name) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await db.users.findFirst({ email });
    return row ? new User(row.id, row.email, row.name) : null;
  }

  async save(entity: User): Promise<User> {
    const data = {
      id: entity.getId(),
      email: entity.email,
      name: entity.name
    };
    const saved = await db.users.upsert(data);
    return new User(saved.id, saved.email, saved.name);
  }

  async delete(id: string): Promise<void> {
    await db.users.delete(id);
  }
}
```

### 6. Unit of Work

Manage transactional boundaries across multiple repositories.

```typescript
import { InfrastructureError, UnitOfWorkBase } from '@hexafy/core';

class DatabaseUnitOfWork extends UnitOfWorkBase {
  constructor(private db: Database) {
    super();
  }

  async commit(): Promise<void> {
    if (this.committed) {
      throw new InfrastructureError('Already committed');
    }
    await this.db.commit();
    this.committed = true;
  }

  async rollback(): Promise<void> {
    await this.db.rollback();
    this.rolledBack = true;
  }

  // Override to add your own state
  private committed = false;
  private rolledBack = false;
}

// Usage
const uow = new DatabaseUnitOfWork(db);
try {
  await uow.withTransaction(async () => {
    await userRepo.save(user);
    await orderRepo.save(order);
  });
  await uow.commit();
} catch (e) {
  await uow.rollback();
  throw e;
}
```

## 🔧 Configuration

### Logger Setup

Provide a `loggerFactory` to enable structured logging:

```typescript
import Pino from 'pino';

const pinoLogger = Pino();

const useCase = new CreateUserUseCase({
  loggerFactory: (name) => ({
    debug: (msg, data) => pinoLogger.debug({ msg, data }),
    info: (msg, data) => pinoLogger.info({ msg, data }),
    warn: (msg, data) => pinoLogger.warn({ msg, data }),
    error: (msg, data) => pinoLogger.error({ msg, data })
  })
});
```

### Dependencies

Configure execution dependencies as needed:

```typescript
const useCase = new CreateUserUseCase({
  generateId: () => crypto.randomUUID()
  // Add custom dependencies as needed
});
```

## 🏗️ Complete Example

```typescript
import {
  Entity,
  failure,
  LoggerPort,
  NotFoundError,
  Repository,
  Result,
  success,
  Usecase,
  UsecaseExecutionDependencies,
  ValidationError
} from '@hexafy/core';

// 1. Define entity
class Product extends Entity<string> {
  constructor(
    id: string,
    public name: string,
    public price: number,
    public stock: number
  ) {
    super(id);
  }
}

// 2. Define repository
class ProductRepository extends Repository<Product, string> {
  constructor(private db: Database) {
    super();
  }

  async findById(id: string): Promise<Product | null> {
    const row = await db.products.get(id);
    return row ? new Product(row.id, row.name, row.price, row.stock) : null;
  }

  async save(product: Product): Promise<Product> {
    const data = {
      id: product.getId(),
      name: product.name,
      price: product.price,
      stock: product.stock
    };
    const saved = await db.products.upsert(data);
    return new Product(saved.id, saved.name, saved.price, saved.stock);
  }
}

// 3. Define use case inputs/outputs
interface CreateProductInput {
  name: string;
  price: number;
  stock: number;
}

interface ProductCreated {
  productId: string;
  name: string;
  price: number;
}

interface GetProductInput {
  productId: string;
}

interface ProductFound {
  product: Product;
}

// 4. Implement use cases
class CreateProductUseCase extends Usecase<CreateProductInput, ProductCreated> {
  constructor(
    dependencies: UsecaseExecutionDependencies,
    private repository: ProductRepository
  ) {
    super(dependencies);
  }

  protected async executeInternal(
    input: CreateProductInput,
    logger: LoggerPort
  ): Promise<Result<ProductCreated>> {
    // Validate input
    if (input.name.length < 3) {
      return failure(new ValidationError('Name too short'));
    }

    if (input.price < 0) {
      return failure(new ValidationError('Price cannot be negative'));
    }

    // Create product
    const productId = this.dependencies.generateId?.() ?? `prod_${Date.now()}`;
    const product = new Product(
      productId,
      input.name,
      input.price,
      input.stock
    );
    const saved = await this.repository.save(product);

    logger.info('Product created', { productId: saved.getId() });

    return success({
      productId: saved.getId(),
      name: saved.name,
      price: saved.price
    });
  }
}

class GetProductUseCase extends Usecase<GetProductInput, ProductFound> {
  constructor(
    dependencies: UsecaseExecutionDependencies,
    private repository: ProductRepository
  ) {
    super(dependencies);
  }

  protected async executeInternal(
    input: GetProductInput,
    logger: LoggerPort
  ): Promise<Result<ProductFound>> {
    logger.debug('Fetching product', { productId: input.productId });

    const product = await this.repository.findById(input.productId);

    if (!product) {
      return failure(new NotFoundError(`Product ${input.productId} not found`));
    }

    return success({ product });
  }
}

// 5. Wire it up
const repo = new ProductRepository(database);
const createUseCase = new CreateProductUseCase({}, repo);
const getUseCase = new GetProductUseCase({}, repo);

// 6. Execute
const result = await createUseCase.execute({
  name: 'Widget',
  price: 29.99,
  stock: 100
});

if (result.success) {
  console.log(`Created product ${result.value.productId}`);
}
```

## 📖 Exported API

```typescript
// Result types
export { Result, success, failure } from './result';

// Use case base class
export { Usecase, UsecaseExecutionDependencies } from './usecase';

// Logger
export { LoggerPort, consoleLogger, NOOP_LOGGER } from './logger';

// Errors
export {
  HexagonalError,
  DomainError,
  UseCaseError,
  InfrastructureError,
  ValidationError,
  NotFoundError,
  ConflictError,
  ForbiddenError,
  UnauthorizedError,
  InvariantError,
  ExternalServiceError,
  InternalServerError,
  TimeoutError,
  RateLimitError,
  ServiceUnavailableError
} from './errors';

// Domain primitives
export { Entity, Repository, UnitOfWorkBase } from './domain';
```

## 🎓 Best Practices

### 1. Always Return Domain Errors

```typescript
// ✅ Good
if (!input.valid) {
  return failure(new ValidationError('Invalid'));
}

// ❌ Bad
if (!input.valid) {
  throw new ValidationError('Invalid');
}
```

### 2. Use Appropriate Error Types

```typescript
// ✅ Good - Resource not found
if (!user) {
  return failure(new NotFoundError('User not found'));
}

// ✅ Good - Invalid input
if (!email.includes('@')) {
  return failure(new ValidationError('Invalid email'));
}

// ✅ Good - Infrastructure failure
try {
  await db.save(data);
} catch (e) {
  throw new InfrastructureError('Save failed', e);
}
```

### 3. Keep Use Cases Focused

Each use case should do one thing and do it well.

```typescript
// ✅ Good — Single responsibility
class TransferFundsUseCase extends Usecase<...> { ... }

// ❌ Bad — Too many concerns
class ManageEverythingUseCase extends Usecase<...> { ... }
```

### 4. Log at Appropriate Levels

```typescript
// ✅ Good
logger.debug('Domain error', { reason: 'Invalid email' });
logger.info('Operation completed', { duration: '42ms' });
logger.error('Infrastructure failure', { operation: 'save' });

// ❌ Bad
logger.error('Invalid email'); // Expected behavior, not an error
```

## 🔗 Related Packages

- `@hexafy/nestjs` — NestJS adapters for hexagonal architecture
- `@hexafy/aws-lambda` — AWS Lambda adapters for serverless applications

## 📄 License

MIT
