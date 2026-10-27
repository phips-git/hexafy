# Hexagonal Architecture TypeScript Template

A monorepo for hexagonal architecture templates in TypeScript. This template provides reusable packages and example applications for building maintainable, testable, and framework-agnostic applications.

## Packages

### Core Package

**`@hex/core`** - v1.0.0

Pure hexagonal architecture constructs with no framework dependencies.

**Exports:**

- `Entity`, `ValueObject`, `AggregateRoot` - Domain primitives
- `Usecase` - Abstract base class for use cases (recommended)
- `UseCase` - Interface for use cases (alternative)
- `Repository`, `RepositoryBase` - Repository pattern
- `UnitOfWork`, `UnitOfWorkBase` - Transaction management
- `Logger`, `consoleLogger` - Logging interface and built-in console logger
- `DomainError`, `UseCaseError`, `RepositoryError` - Error hierarchy

**Learn more**: [`packages/core/README.md`](./packages/core/README.md)

### AWS Lambda Package

**`@hex/aws-lambda`** - v1.0.0

AWS Lambda adapters and helpers for hexagonal architecture.

**Exports:**

- `createLambdaHandler` - Create Lambda handlers from use cases
- `parseJsonBody` - Parse request body
- `formatSuccess`, `formatError` - Response formatters

**Learn more**: [`packages/aws-lambda/README.md`](./packages/aws-lambda/README.md)

### NestJS Package

**`@hex/nestjs`** - v1.0.0

NestJS adapters and helpers for hexagonal architecture.

**Exports:**

- `DomainModule` - Domain layer module
- `createUsecaseProvider` - Register use cases as providers
- `DomainExceptionFilter` - Handle domain errors (→ 400)
- `UseCaseFilter` - Handle use case errors (→ 400)

**Learn more**: [`packages/nestjs/README.md`](./packages/nestjs/README.md)

## Example Applications

### AWS Lambda Example

A complete example of using `@hex/core` and `@hex/aws-lambda` to build Lambda functions.

**Features:**

- Say Hello use case with logging
- Create User use case with validation
- In-memory repository
- Lambda handler with input/output transformation

**Location**: [`apps/aws-lambda/`](./apps/aws-lambda/)

**Learn more**: [`apps/aws-lambda/README.md`](./apps/aws-lambda/README.md)

### NestJS Example

A complete example of using `@hex/core` and `@hex/nestjs` to build NestJS applications.

**Features:**

- Say Hello endpoint
- Create User endpoint with validation
- Exception filters for automatic error handling
- Domain layer isolation

**Location**: [`apps/nestjs/`](./apps/nestjs/)

**Learn more**: [`apps/nestjs/README.md`](./apps/nestjs/README.md)

## Quick Start

### Using the Packages

```bash
# Install core package
npm install @hex/core
```

### Example: Using the Base UseCase Class (Recommended)

```typescript
import {
  Usecase,
  UsecaseExecutionDependencies,
  Logger,
  UseCaseError
} from '@hex/core';

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
    // Use logger for custom logging
    logger.debug('Starting user creation', { email: input.email });

    if (!input.email || !input.email.includes('@')) {
      throw new UseCaseError('Invalid email format');
    }

    // Your business logic here
    const userId = `user_${Date.now()}`;
    // Save user...

    return { userId };
  }
}

// Usage:
const useCase = new CreateUserUseCase({
  generateId: () => `user_${Date.now()}`,
  loggerFactory: (name) => console // or your custom logger
});

await useCase.execute({ name: 'John', email: 'john@example.com' });
```

### Example: Using the UseCase Interface (Alternative)

```typescript
import { UseCase, UseCaseError } from '@hex/core';

class CreateUserUseCase implements UseCase<CreateUserInput, UserCreated> {
  constructor(private userRepository: Repository) {}

  async execute(input): Promise<UserCreated> {
    if (!input.email) {
      throw new UseCaseError('Email is required');
    }

    const userId = `user_${Date.now()}`;
    // Save user...

    return { userId };
  }
}
```

## Architecture Principles

### Design Philosophy

This template follows **practical hexagonal architecture** with a focus on:

1. **Framework-agnostic domain logic** - Use cases know nothing about AWS, NestJS, databases, etc.
2. **Explicit dependency injection** - All dependencies are passed in via constructor
3. **Built-in cross-cutting concerns** - The `Usecase` base class handles logging, execution IDs, and error tracking
4. **Type safety** - Full TypeScript support with no `any` types

### 1. Pure Domain Layer

Domain logic is completely framework-agnostic:

```typescript
class CreateUserUseCase extends Usecase<CreateUserInput, UserCreated> {
  protected async executeInternal(input, logger) {
    // Pure business logic
    // No framework imports
    // No infrastructure details
  }
}
```

### 2. Base UseCase for Cross-Cutting Concerns

The `Usecase` base class handles all cross-cutting concerns automatically:

- Logging with context
- Execution ID generation
- Duration tracking
- Error handling and logging

### 3. Framework-Specific Adapters

Frameworks provide adapters to integrate with use cases:

- `@hex/aws-lambda` → Lambda handlers
- `@hex/nestjs` → NestJS modules and filters

### 4. Repository Pattern

Repositories abstract data access:

```typescript
class UserRepository extends Repository<User, string> {
  async findById(id: string): Promise<User | null> {
    // Implementation details hidden
  }
}
```

### 5. Error Hierarchy

Consistent error handling across frameworks:

```
HexagonalError
├── DomainError        (business rule violations)
├── UseCaseError       (use case execution errors)
└── RepositoryError    (database errors)
```

## Bun Setup

This template uses **bun** as the package manager. Ensure you have bun >=1.4.2 installed.

### Quick Start with Bun

```bash
# Install dependencies
bun install

# Type check all packages
bun run typecheck

# Run tests
bun run test

# Build all packages
bun run build --workspaces
```

### Publishing to npm

The template is configured to publish to the official npm registry using bun:

```bash
# Publish all packages (in dependency order)
bun run publish

# Publish only the core package
bun run publish:core

# Dry run to preview what would be published
bun publish --dry-run

# Publish with specific tag (e.g., alpha, beta, next)
bun publish --tag alpha -F '@hex/core'
```

**Publish Configuration:**

- All packages are configured with `publishConfig.access: "public"`
- Bun handles workspace dependencies automatically
- `prepare` script runs `bun run build` before publishing
- Workspace dependencies use exact versions (e.g., `"@hex/core": "1.0.0"`)

### bunfig.toml

The repository uses `bunfig.toml` for bun configuration:

- `registry`: Official npm registry
- `lockfile`: Enabled for reproducible builds
- `workspaces`: Automatic discovery from `package.json` workspaces field

## Project Structure

```
hexagonal-architecture-typescript-template/
├── packages/
│   ├── core/              # @hex/core v1.0.0
│   ├── aws-lambda/        # @hex/aws-lambda v1.0.0
│   └── nestjs/            # @hex/nestjs v1.0.0
├── apps/
│   ├── aws-lambda/        # AWS Lambda example
│   └── nestjs/            # NestJS example
├── package.json           # Workspace root
└── pnpm-workspace.yaml    # Pnpm workspace config
```

## Using Your Own Logger

The `Usecase` base class accepts any logger that implements the `Logger` interface:

```typescript
import { Logger } from '@hex/core';

// Your custom logger
class MyLogger implements Logger {
  info(message: string, data?: unknown): void {
    /* ... */
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

const logger = new MyLogger();

const useCase = new CreateUserUseCase({
  generateId: () => `user_${Date.now()}`,
  loggerFactory: () => logger
});
```

## Design Decisions

### Why a Base Class for Use Cases?

This template uses a `Usecase` base class to handle cross-cutting concerns automatically (logging, execution IDs, error handling).

**Why not pure hexagonal architecture?**

Pure hexagonal architecture would require application services to handle cross-cutting concerns separately:

```typescript
// Pure approach: separate application service
class CreateUserService {
  constructor(
    private useCase: CreateUserUseCase,
    private logger: Logger
  ) {}

  async handle(input) {
    const executionId = this.generateId();
    const startTime = Date.now();

    try {
      const result = await this.useCase.execute(input);
      this.logger.info('Success', {
        executionId,
        duration: Date.now() - startTime
      });
      return result;
    } catch (error) {
      this.logger.error('Failed', { executionId, error });
      throw error;
    }
  }
}
```

**Why the base class approach is better for this template:**

- ✅ **Less boilerplate** - One line instead of 20+
- ✅ **Consistent behavior** - All use cases logged the same way
- ✅ **Better DX** - Easier to learn and use
- ✅ **Maintains boundaries** - Domain logic is still framework-agnostic
- ✅ **Still hexagonal** - Just pragmatic rather than "pure"

**Trade-off acknowledged:**

The base class mixes cross-cutting concerns (logging) into the use case layer. However, this is:

- Confined to the `@hex/core` package (your infrastructure)
- Does not affect domain purity
- Can be avoided by implementing `UseCase` interface directly

Choose the approach that fits your team's preferences:

- **Base class** (`extends Usecase`) - For most teams, fastest path to production
- **Interface** (`implements UseCase`) - For strict hexagonal purists

See [`packages/core/README.md`](./packages/core/README.md) for details.

## License

MIT
