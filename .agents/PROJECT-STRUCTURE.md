# Project Structure

## Packages

| Package                  | Purpose              |
| ------------------------ | -------------------- |
| `@hexafy/core`           | Hexagonal primitives |
| `@hexafy/nestjs`         | NestJS adapters      |
| `@hexafy/aws-lambda`     | Lambda adapters      |
| `@hexafy/email`          | Email domain         |
| `@hexafy/object-storage` | Object storage       |

## Internal Structure

```
packages/<name>/
├── src/
│   ├── domain/          # Models, ports
│   ├── application/     # Use cases
│   └── infrastructure/  # Adapters
└── package.json
```

## Imports

Also see [CODESTYLE.md](./CODESTYLE.md) for naming and code organization patterns.

```typescript
import { failure, success, Usecase } from '@hexafy/core/application';
import type { Entity } from '@hexafy/core/domain';
```

## Domain Primitives

```typescript
import {
  AggregateRoot,
  ApplicationError,
  Entity,
  RepositoryBase,
  UnitOfWorkBase,
  ValidationError,
  ValueObject
} from '@hexafy/core/domain';
import type { Brand, UniqueIdentifier } from '@hexafy/core/domain';
```

## Ports & Adapters

```typescript
import type {
  ClockPort,
  IdentifierPort,
  LoggerPort,
  MetricsPort
} from '@hexafy/core/application';
import {
  ConsoleLoggingAdapter,
  NoOpLoggingAdapter,
  NoOpMetricsAdapter,
  SystemClockAdapter
} from '@hexafy/core/infrastructure';
```

## Result Handling

```typescript
import {
  failure,
  isFailure,
  isSuccess,
  success,
  unwrap
} from '@hexafy/core/application';

// Create results
const result = success({ id: 'user_123' });
const error = failure(new Error('failed'));

// Check result
if (isSuccess(result)) {
  console.log(result.value);
} else {
  console.error(result.error);
}

// Use with use cases
const userResult = await userUseCase.execute(input);
if (isSuccess(userResult)) {
  // Handle success
} else {
  // Handle failure
}
```

## See Also

- [AGENTS.md](../AGENTS.md) - Overview of agent configuration
- [CODESTYLE.md](./CODESTYLE.md) - Coding standards

## Exports

The `@hexafy/core` package exposes its public API through the package subpaths below. In local development, Bun loads the TypeScript source directly; for publishing, the package swaps to `dist/` via `publishConfig.exports`.

```json
{
  "exports": {
    "./application": "./src/application/index.ts",
    "./domain": "./src/domain/index.ts",
    "./infrastructure": "./src/infrastructure/index.ts"
  },
  "publishConfig": {
    "exports": {
      "./application": {
        "types": "./dist/application.d.mts",
        "import": "./dist/application.mjs"
      },
      "./domain": {
        "types": "./dist/domain.d.mts",
        "import": "./dist/domain.mjs"
      },
      "./infrastructure": {
        "types": "./dist/infrastructure.d.mts",
        "import": "./dist/infrastructure.mjs"
      }
    }
  }
}
```
