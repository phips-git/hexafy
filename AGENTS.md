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
├── core/              # @hexafy/core - Domain primitives, Usecase base class
├── aws-lambda/        # @hexafy/aws-lambda - Lambda adapters
└── nestjs/            # @hexafy/nestjs - NestJS adapters

apps/
├── aws-lambda/        # AWS Lambda example application
└── nestjs/            # NestJS example application
```

### Use Case Pattern

Extend `Usecase` base class - dependencies are optional:

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

  protected async executeInternal(input, logger: LoggerPort): Promise<Result<UserCreated>> {
    logger.debug('Starting', { input });  // Logger always available (NOOP if not configured)
    return success({ userId: this.dependencies.generateId?.() ?? `user_${Date.now()}` });
  }
}
````

### Error Handling

```typescript
import {
  InfrastructureError,
  NotFoundError,
  ValidationError
} from '@hexafy/core';

// Domain errors
throw new ValidationError('Invalid email');
throw new NotFoundError('User not found');

// Infrastructure errors
throw new InfrastructureError('DB failed', e);
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
bun publish -F '@hexafy/core'
```

Avoid using npm or pnpm commands - use bun instead.
