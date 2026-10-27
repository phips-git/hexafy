# Agent Configuration

This folder contains configuration and documentation for AI agents working with the codebase.

## Documentation

- **[.agents/CODESTYLE.md](./.agents/CODESTYLE.md)** - Coding standards, best practices, and naming conventions

## Guidelines

Agents should follow the codestyle guidelines when generating or modifying code. Key principles:

- Write self-explanatory code with clear naming
- Maintain complete type safety (no `any` types)
- No unnecessary comments or JSDoc
- Import directly from source modules
- Follow hexagonal architecture boundaries

## Hexagonal Architecture Guidelines

### Package Structure

This template follows a hexagonal architecture pattern:

```
packages/
├── core/              # @hex/core - Domain primitives, Usecase base class
├── aws-lambda/        # @hex/aws-lambda - Lambda adapters
└── nestjs/            # @hex/nestjs - NestJS adapters

apps/
├── aws-lambda/        # AWS Lambda example application
└── nestjs/            # NestJS example application
```

### Use Case Pattern

Use the `Usecase` base class for clean implementation with built-in cross-cutting concerns:

```typescript
import { Usecase, UsecaseExecutionDependencies, Logger } from '@hex/core';

class CreateUserUseCase extends Usecase<CreateUserInput, UserCreated> {
  constructor(dependencies: UsecaseExecutionDependencies) {
    super(dependencies);
  }

  protected async executeInternal(input, logger: Logger) {
    // Business logic only
    logger.debug('Starting', { input });
    return { userId: this.dependencies.generateId() };
  }
}
```

### Import from Source

Always import directly from the source package, not from re-exports:

```typescript
// ✅ Correct
import { Usecase } from '@hex/core';

// ❌ Wrong - don't import from subpaths
import { Usecase } from '@hex/core/src';
```

### Logger Usage

Use the `Logger` interface for logging - never use `console.log` directly in use cases:

```typescript
protected async executeInternal(input, logger: Logger) {
  logger.info('User created', { userId: result.userId });
}
```

### Error Handling

Use the domain error hierarchy:

```typescript
throw new UseCaseError('Invalid email format');
throw new DomainError('User already exists');
```

## Available Skills

See the `skill` tool for available capabilities like:

- `safe-refactor` - Restructure code while preserving behavior
- `surgical-patch` - Fix bugs with minimal changes
- `lean-build` - Build features with strict scope

## Bun Commands

This template uses bun for all package management:

```bash
# Install dependencies
bun install

# Run scripts with bun
bun run <script>

# Run TypeScript directly
bun run <file.ts>

# Publish packages
bun publish --recursive
bun publish -F '@hex/core'
```

Avoid using npm or pnpm commands - use bun instead.
