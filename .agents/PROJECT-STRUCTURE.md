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

## Version Management

- Changesets handle versioning (`.changeset/*.md`)
- Internal deps auto-bump (`patch`)
- Release via GitHub Actions **Release** workflow (`rc`/`latest`)
