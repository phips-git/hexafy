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
import { Usecase } from '@hexafy/core/application';
import type { Entity } from '@hexafy/core/domain';
```

## Domain Primitives

```typescript
import {
  AggregateRoot,
  Entity,
  RepositoryBase,
  UnitOfWorkBase,
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
} from '@hexafy/core/domain';
import {
  ConsoleLoggingAdapter,
  NoOpMetricsAdapter
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
const result = success(value);
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

Local development uses Bun-native TypeScript sources. The publishable tarball intentionally swaps to `dist/` via `publishConfig.exports`; this avoids shipping `src/*.ts` paths to npm consumers.

```json
{
  "type": "module",
  "exports": {
    "./domain": "./src/domain.export.ts"
  },
  "publishConfig": {
    "exports": {
      "./domain": {
        "types": "./dist/domain.export.d.ts",
        "import": "./dist/domain.export.js"
      }
    }
  }
}
```
