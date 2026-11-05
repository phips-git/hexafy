# Codestyle

## Principles

- **Self-explanatory code** - Clear names, no unnecessary comments
- **No `any` types** - Full type safety required
- **Direct imports** - No convenience re-exports
- **Small functions** - Single responsibility

## Imports

```typescript
// ✅ Import from source
import { Usecase } from '@hexafy/core/domain';
import type { Entity } from '@hexafy/core/domain';
// ❌ No re-exports
import { Usecase } from '@hexafy/nestjs/domain'; // Wrong
```

## Naming

- **Classes**: PascalCase (`SqliteDatabaseClient`)
- **Functions**: camelCase (`initializeSchema`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Types**: PascalCase (`TaskStatus`)

## Hexagonal Patterns

### Use Cases

Extend `Usecase` base class:

```typescript
import { failure, success, Usecase } from '@hexafy/core/application';

class CreateUserUseCase extends Usecase<Input, Output> {
  async executeInternal(input, logger) {
    if (!input.email) {
      return failure(new ValidationError('Email required'));
    }
    return success({ userId: '123' });
  }
}
```

### Errors

- **Domain errors**: Return via `Result` (don't throw)
- **Infrastructure errors**: Throw (`NotFoundError`, `ValidationError`, etc.)

### Exports

Import from subpaths:

```typescript
import { Usecase } from '@hexafy/core/application';
import { Usecase } from '@hexafy/core/domain';
import { LoggerPort } from '@hexafy/core/infrastructure';
```

## Commands

```bash
bun install
bun run typecheck
bun run test
bun run build
```
