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

```typescript
import { Usecase } from '@hexafy/core/application';
import type { Entity } from '@hexafy/core/domain';
```

## Exports

All packages use dual-exports for bun/npm:

```json
{
  "exports": {
    "./domain": {
      "bun": "./src/domain/index.ts",
      "types": "./src/domain/index.ts",
      "import": {
        "development": "./src/domain/index.ts",
        "production": "./dist/domain/index.js"
      }
    }
  }
}
```

## Version Management

- Changesets handle versioning (`.changeset/*.md`)
- Internal deps auto-bump (`patch`)
- Release via GitHub Actions **Release** workflow (`rc`/`latest`)
