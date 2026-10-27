# @hex/core

Core hexagonal architecture constructs for TypeScript applications.

## Installation

```bash
npm install @hex/core
```

## What is this?

This package provides the building blocks for implementing **textbook hexagonal architecture** in TypeScript. It contains pure domain constructs that are independent of any framework or infrastructure.

## Core Constructs

### Using the Usecase Base Class (Recommended)

The recommended approach is to extend the `Usecase` base class which handles all cross-cutting concerns automatically:

```typescript
import { Usecase, UsecaseExecutionDependencies, Logger } from '@hex/core';

interface CreateUserInput {
  name: string;
  email: string;
}

interface UserCreated {
  userId: string;
}

class CreateUserUseCase extends Usecase<CreateUserInput, UserCreated> {
  constructor(dependencies: UsecaseExecutionDependencies) {
    super(dependencies);
  }

  protected async executeInternal(
    input: CreateUserInput,
    logger: Logger
  ): Promise<UserCreated> {
    // Use the logger for custom logging if needed
    logger.debug('Starting user creation', { email: input.email });

    // Your business logic here
    const userId = this.dependencies.generateId();

    return { userId };
  }
}

// Usage:
const useCase = new CreateUserUseCase({
  generateId: () => `user_${Date.now()}`,
  loggerFactory: (name) => consoleLogger // or your custom logger
});

await useCase.execute({ name: 'John', email: 'john@example.com' });
```

**Base Class Benefits**:

The `Usecase` base class provides built-in cross-cutting concerns:

- ✅ **Automatic logging** - All executions are logged with execution context
- ✅ **Unique execution IDs** - Trace requests across your system
- ✅ **Duration tracking** - Monitor performance automatically
- ✅ **Error handling** - Errors are logged before being re-thrown
- ✅ **Clean implementation** - Focus on business logic only

### Domain Types

```typescript
import {
  Entity,
  ValueObject,
  AggregateRoot,
  UniqueIdentifier
} from '@hex/core';

// Entity - has identity
class User extends Entity<string> {
  constructor(
    id: string,
    private readonly name: string,
    private readonly email: string
  ) {
    super(id);
  }

  getName(): string {
    return this.name;
  }

  getEmail(): string {
    return this.email;
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this._id,
      name: this.name,
      email: this.email
    };
  }
}

// Value Object - no identity, defined by attributes
class Email implements ValueObject {
  constructor(private readonly value: string) {}

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toJSON(): Record<string, unknown> {
    return { value: this.value };
  }

  toString(): string {
    return this.value;
  }
}
```

### Base UseCase Class (Recommended)

The recommended approach is to extend the `Usecase` base class which handles all cross-cutting concerns:

```typescript
import { Usecase, UsecaseExecutionDependencies, Logger } from '@hex/core';

interface CreateUserInput {
  name: string;
  email: string;
}

interface UserCreated {
  userId: string;
}

class CreateUserUseCase extends Usecase<CreateUserInput, UserCreated> {
  constructor(dependencies: UsecaseExecutionDependencies) {
    super(dependencies);
  }

  protected async executeInternal(
    input: CreateUserInput,
    logger: Logger
  ): Promise<UserCreated> {
    // Use the logger for custom logging
    logger.debug('Starting user creation', { email: input.email });

    // Your business logic here
    const userId = this.dependencies.generateId();

    // Save user...

    return { userId };
  }
}

// Usage:
const useCase = new CreateUserUseCase({
  generateId: () => `user_${Date.now()}`,
  loggerFactory: (name) => consoleLogger // or your custom logger
});

await useCase.execute({ name: 'John', email: 'john@example.com' });
```

### Base UseCase Benefits

The `Usecase` base class provides:

- ✅ **Automatic logging** - All executions are logged with context
- ✅ **Unique execution IDs** - Trace requests across your system
- ✅ **Duration tracking** - Monitor performance automatically
- ✅ **Error handling** - Errors are logged before being re-thrown
- ✅ **Clean implementation** - Focus on business logic only

### UseCase Interface (Alternative)

If you prefer a simpler approach without the base class:

```typescript
import { UseCase, UseCaseError } from '@hex/core';

interface CreateUserInput {
  name: string;
  email: string;
}

interface UserCreated {
  userId: string;
}

class CreateUserUseCase implements UseCase<CreateUserInput, UserCreated> {
  constructor(private readonly userRepository: Repository<User, string>) {}

  async execute(input: CreateUserInput): Promise<UserCreated> {
    if (!input.email || !input.email.includes('@')) {
      throw new UseCaseError('Invalid email format');
    }

    if (!input.name || input.name.length < 2) {
      throw new UseCaseError('Name must be at least 2 characters');
    }

    const userId = `user_${Date.now()}`;
    const user = new User(userId, input.name, input.email);
    await this.userRepository.save(user);

    return { userId };
  }
}
```

### Repositories

```typescript
import { Repository } from '@hex/core';

class User extends Entity<string> {
  // ... entity definition
}

class UserRepository extends Repository<User, string> {
  async findById(id: string): Promise<User | null> {
    // Find by ID - database specific
    const user = await this.db.users.findOne({ id });
    return user ? new User(user.id, user.name, user.email) : null;
  }

  async findAll(): Promise<User[]> {
    // Find all - basic CRUD only
    const users = await this.db.users.find();
    return users.map((u) => new User(u.id, u.name, u.email));
  }

  async save(entity: User): Promise<User> {
    // Save or update - database specific
    const data = {
      id: entity.getId(),
      name: entity.getName(),
      email: entity.getEmail()
    };

    const saved = await this.db.users.save(data);
    return new User(saved.id, saved.name, saved.email);
  }

  async delete(id: string): Promise<void> {
    await this.db.users.delete(id);
  }
}
```

### Unit of Work

```typescript
import { UnitOfWork, RepositoryError } from '@hex/core';

class DatabaseUnitOfWork implements UnitOfWork {
  private committed: boolean = false;
  private rolledBack: boolean = false;

  constructor(private readonly database: Database) {}

  async commit(): Promise<void> {
    if (this.committed) {
      throw new RepositoryError('Already committed');
    }
    if (this.rolledBack) {
      throw new RepositoryError('Cannot commit after rollback');
    }

    // Perform transaction commit
    await this.database.commit();
    this.committed = true;
  }

  async rollback(): Promise<void> {
    // Perform transaction rollback
    await this.database.rollback();
    this.rolledBack = true;
  }

  async transaction<T>(fn: (uw: UnitOfWork) => Promise<T>): Promise<T> {
    try {
      const result = await fn(this);
      await this.commit();
      return result;
    } catch (error) {
      await this.rollback();
      throw error;
    }
  }
}
```

**Usage with repositories:**

```typescript
class CreateUserUseCase extends Usecase<CreateUserInput, UserCreated> {
  constructor(
    dependencies: UsecaseExecutionDependencies,
    private readonly userRepository: Repository<User, string>,
    private readonly unitOfWork: UnitOfWork
  ) {
    super(dependencies);
  }

  protected async executeInternal(
    input: CreateUserInput,
    logger: Logger
  ): Promise<UserCreated> {
    return this.unitOfWork.transaction(async (uw) => {
      const userId = `user_${Date.now()}`;
      const user = new User(userId, input.name, input.email);
      await this.userRepository.save(user);
      await uw.commit();

      return { userId };
    });
  }
}
```

### Errors

```typescript
import {
  HexagonalError,
  DomainError,
  UseCaseError,
  RepositoryError
} from '@hex/core';

// Domain error - business rule violation
throw new DomainError('User already exists with this email');

// Use case error - invalid input or execution failure
throw new UseCaseError('Invalid email format');

// Repository error - database operation failed
throw new RepositoryError('Database connection failed', error);
```

**Error hierarchy:**

```
HexagonalError (base)
├── DomainError         (business logic errors)
├── UseCaseError        (use case execution errors)
└── RepositoryError     (infrastructure/database errors)
```

### Logging

The `Logger` interface is defined in the core package:

```typescript
interface Logger {
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
  debug(message: string, data?: unknown): void;
}
```

**Built-in console logger:**

```typescript
import { consoleLogger } from '@hex/core';

// Use directly or pass to loggerFactory
const logger = consoleLogger;
```

**Custom logger implementations:**

```typescript
import { Logger } from '@hex/core';

class CustomLogger implements Logger {
  info(message: string, data?: unknown): void {
    // Your custom implementation
  }
  warn(message: string, data?: unknown): void {
    /* ... */
  }
  error(message: string, data?: unknown): void {
    /* ... */
  }
  debug(message: string, data?: unknown): void {
    /* ... */
  }
}
```

## Package Structure

```
@hex/core
├── types/           # Entity, ValueObject, AggregateRoot, IdGenerator
├── usecase/         # UseCase interface, Usecase base class
├── repository/      # Repository interface, Repository base class
├── unit-of-work/    # UnitOfWork interface, UnitOfWork base class
├── errors/          # Error hierarchy
└── logger/          # Logger interface, consoleLogger
```

## Error Handling Best Practices

### Use Case Level

Use cases should:

1. **Throw specific errors** for different failure types
2. **Log with the provided logger** in `executeInternal`
3. **Let the base class handle** execution logging and error handling

```typescript
class CreateUserUseCase extends Usecase<CreateUserInput, UserCreated> {
  protected async executeInternal(input, logger) {
    // Log start
    logger.info('Starting user creation', { email: input.email });

    // Business logic
    if (userExists) {
      throw new DomainError('User already exists');
    }

    // Success
    return { userId: id };
  }
}
```

## Framework Packages

This package provides pure domain constructs only. Framework-specific implementations are in separate packages:

- **`@hex/aws-lambda`** - AWS Lambda adapters, error handlers, response formatters
- **`@hex/nestjs`** - NestJS decorators, exception filters, DI providers
- **`@hex/logger-pino`** - Pino logger adapter
- **`@hex/logger-winston`** - Winston logger adapter

## Examples

See the example applications in the `apps` folder:

- `apps/aws-lambda-example` - Complete Lambda application
- `apps/nestjs-example` - Complete NestJS application

## License

MIT
