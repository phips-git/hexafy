# @hexafy/example-domain

A complete domain example demonstrating how to use `@hexafy/core` to build hexagonal architecture applications.

## Overview

This package shows a practical implementation of hexagonal architecture with:

- **Authentication domain** - User management and authentication
- **Task Management domain** - Projects and tasks with business rules
- **Domain-driven design** - Aggregate roots, value objects, domain events
- **Repository pattern** - With both ports (interfaces) and adapters (implementations)
- **Use cases** - Application layer with dependency injection

## Package Structure

```
example-domain/
├── src/
│   ├── domain/                  # Domain layer (business logic)
│   │   ├── auth/
│   │   │   ├── models/          # User, UserId (value objects)
│   │   │   └── ports/           # UserPort, AuthenticationPort (interfaces)
│   │   └── task-management/
│   │       ├── models/          # Task, Project, Tenant
│   │       ├── policies/        # Business rules (TaskStatusPolicy, etc.)
│   │       ├── ports/           # TaskPort, ProjectPort (interfaces)
│   │       └── validators/      # Domain validators
│   ├── application/             # Application layer (use cases)
│   │   ├── auth/
│   │   │   └── usecases/        # CreateUseCase, AuthenticateUseCase
│   │   └── task-management/
│   │       └── usecases/        # CreateTaskUseCase, CompleteTaskUseCase
│   └── infrastructure/          # Infrastructure layer
│       ├── auth/
│       │   └── adapters/        # InMemoryUserRepository
│       └── task-management/
│           └── adapters/        # InMemoryTaskRepository
```

## Dependencies

This package depends on `@hexafy/core` and demonstrates:

- Using `Usecase` base class for cross-cutting concerns
- `Result` type for functional error handling
- Domain errors (`DomainError`, `ValidationError`, etc.)
- Repository pattern with `RepositoryBase`
- `AggregateRoot` for DDD aggregates
- `Brand` type for type-safe IDs

## Usage

### Importing from the example

```typescript
// Use cases
import { CreateUseCase } from '@hexafy/example-domain/application';
// Domain models
import { User } from '@hexafy/example-domain/domain';
import {
  Task,
  TaskStatus
} from '@hexafy/example-domain/domain/task-management';
// Infrastructure
import { InMemoryUserRepository } from '@hexafy/example-domain/infrastructure';
```

### Using with @hexafy/core primitives

```typescript
import {
  failure,
  LoggerPort,
  Result,
  success,
  Usecase,
  UsecaseExecutionDependencies,
  ValidationError
} from '@hexafy/core';

interface CreateUserInput {
  email: string;
  password: string;
  name?: string;
}

class CreateUserUseCase extends Usecase<CreateUserInput, User> {
  constructor(
    private readonly userRepository: UserPort,
    dependencies: UsecaseExecutionDependencies
  ) {
    super(dependencies);
  }

  protected async executeInternal(
    input: CreateUserInput,
    logger: LoggerPort // Logger always available (NOOP if not configured)
  ): Promise<Result<User>> {
    // Validate
    if (!input.email.includes('@')) {
      return failure(new ValidationError('Invalid email format'));
    }

    // Business logic
    const user = await this.userRepository.save({
      id: this.dependencies.generateId?.() ?? `user_${Date.now()}`,
      email: input.email,
      name: input.name ?? null,
      role: 'member',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    logger.info('User created', { userId: user.id });
    return success(user);
  }
}
```

## Architecture

### Domain Layer

Pure business logic, no external dependencies:

- **Models** - Entities (`User`, `Task`), Value Objects (`UserId`, `ProjectId`)
- **Ports** - Repository interfaces (what the domain needs)
- **Policies** - Business rules (`TaskStatusPolicy`)
- **Validators** - Domain validation (`TaskValidators`)

### Application Layer

Orchestrates use cases:

- **Use Cases** - Business operations (`CreateTaskUseCase`)
- Uses `Usecase` base class for automatic logging, execution IDs, error handling

### Infrastructure Layer

Implements domain ports:

- **Repositories** - `InMemoryUserRepository` implements `UserPort`
- **Adapters** - Can be extended with SQLite, TypeORM, etc.

## Running the Example

```bash
# Install dependencies
bun install

# Type check
bun run typecheck

# Run the example entry point
bun run example
```

## Key Concepts Demonstrated

### 1. Domain-Driven Design

```typescript
class Task extends AggregateRoot<TaskId> {
  complete(): void {
    TaskStatusPolicy.validateTransition(this, TaskStatus.COMPLETED);
    this.status = TaskStatus.COMPLETED;
    this.incrementVersion();
  }
}
```

### 2. Repository Pattern

```typescript
// Port (interface)
interface TaskPort {
  findById(id: string): Promise<Task | null>;
  findByProjectId(projectId: string): Promise<Task[]>;
}

// Adapter (implementation)
class InMemoryTaskRepository implements TaskPort {
  // Implementation
}
```

### 3. Use Case with Cross-Cutting Concerns

```typescript
class CreateTaskUseCase extends Usecase<CreateTaskInput, Task> {
  // Automatic: logging, execution IDs, duration tracking
  // Manual: business logic only
}
```

### 4. Type-Safe IDs with Brand

```typescript
import { Brand } from '@hexafy/core/brand';

export type TaskId = Brand<string, 'TaskId'>;
export type UserId = Brand<string, 'UserId'>;
```

## License

MIT
