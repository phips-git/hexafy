# Hexafy

Turn your TypeScript project into hexagonal architecture — with ready-to-use primitives, adapters, and examples.

## 📦 Publishable Packages

| Package                  | Description                                                               |
| ------------------------ | ------------------------------------------------------------------------- |
| `@hexafy/core`           | Hexagonal architecture primitives (use cases, repositories, unit of work) |
| `@hexafy/nestjs`         | NestJS adapters for hexagonal architecture                                |
| `@hexafy/aws-lambda`     | AWS Lambda adapters                                                       |
| `@hexafy/email`          | Email sending with multiple providers                                     |
| `@hexafy/object-storage` | File storage with S3, GCS, local adapters                                 |

## 📚 Example Applications

- **Example Domain** - Complete domain application in `packages/example-domain/`
- **NestJS Example** - Full NestJS app in `apps/nestjs/`
- **AWS Lambda Example** - Lambda app in `apps/aws-lambda/`

## 🚀 Quick Start

### Installation

```bash
bun install
```

### Using the Core Package

```typescript
import { Result, success } from '@hexafy/core/result';
import { Usecase } from '@hexafy/core/usecase';

class CreateUserUseCase extends Usecase<{ name: string }, { userId: string }> {
  protected async executeInternal(input) {
    const userId = this.dependencies.generateId?.() ?? `user_${Date.now()}`;
    return { userId };
  }
}
```

## 🏗️ Project Structure

```
hexafy/
├── packages/          # All packages
│   ├── core/          # Core primitives (publishable)
│   ├── nestjs/        # NestJS adapters (publishable)
│   ├── aws-lambda/    # AWS adapters (publishable)
│   ├── email/         # Email package (publishable)
│   ├── object-storage/# Storage package (publishable)
│   └── example-domain/# Example app (not published)
└── apps/              # Framework apps (not published)
    ├── nestjs/
    └── aws-lambda/
```

## 🔧 Scripts

```bash
bun run typecheck   # Type check all packages
bun run test        # Run all tests
bun run format      # Format code
bun run lint        # Run ESLint via Bun
```

## 📦 Publishing Packages

This monorepo uses **Changesets** for individual package versioning and publishing.

Quick commands:

- `bun run changeset` - Create a changeset for a package
- `bun run changeset:version` - Version all changed packages
- `bun run changeset:publish` - Publish versioned packages to npm

Releases are run from the GitHub Actions **Release** workflow (`rc` → `next`, `latest` → `latest`).
See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for release policy and first-release details.

### Publishable Packages

| Package                  | Scope |
| ------------------------ | ----- |
| `@hexafy/core`           | ✅    |
| `@hexafy/nestjs`         | ✅    |
| `@hexafy/aws-lambda`     | ✅    |
| `@hexafy/email`          | ✅    |
| `@hexafy/object-storage` | ✅    |

Private packages (not published):

- `@hexafy/typescript-config`
- `@hexafy/example-domain`

## 📖 Learn More

- Core: [`packages/core/README.md`](./packages/core/README.md)
- Example Domain: [`packages/example-domain/README.md`](./packages/example-domain/README.md)
- NestJS App: [`apps/nestjs/README.md`](./apps/nestjs/README.md)
- Lambda App: [`apps/aws-lambda/README.md`](./apps/aws-lambda/README.md)

## 📄 License

MIT — See [LICENSE](./LICENSE)
