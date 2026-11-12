# Hexafy

Turn your TypeScript project into hexagonal architecture — with ready-to-use primitives, adapters, and examples.

## 📦 Publishable Packages

| Package                  | Description                                                                         |
| ------------------------ | ----------------------------------------------------------------------------------- |
| `@hexafy/core`           | Hexagonal architecture primitives (use cases, services, repositories, unit of work) |
| `@hexafy/nestjs`         | NestJS adapters for hexagonal architecture                                          |
| `@hexafy/aws-lambda`     | AWS Lambda adapters                                                                 |
| `@hexafy/email`          | Email sending with multiple providers                                               |
| `@hexafy/object-storage` | File storage with S3, GCS, local adapters                                           |

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
import { Usecase } from '@hexafy/core/application';
import { ValidationError } from '@hexafy/core/domain';

class CreateUserUseCase extends Usecase<{ email: string }, { userId: string }> {
  protected async executeInternal(input: {
    email: string;
  }): Promise<{ userId: string }> {
    if (!input.email.includes('@')) {
      throw new ValidationError('Invalid email');
    }
    return { userId: `user_${Date.now()}` };
  }
}

const result = await new CreateUserUseCase().execute({
  email: 'john@example.com'
});

if (result.success) {
  console.log(result.value);
} else {
  console.error(result.error.message);
}
```

## 🧭 Implementation Strategies for Entry Point Ports

In hexagonal architecture, **inbound (input) ports** are the entry points where external actors (controllers, Lambda handlers, event handlers, CLI commands) call into the application layer. `@hexafy/core` offers two implementation strategies for them:

### `Usecase` — full-featured entry point

A base class for single, self-contained operations (commands and queries). It automatically provides:

- Structured logging with a unique execution ID
- Duration tracking plus error and cancellation metrics
- Cancellation support via `CancellationToken`
- Automatic wrapping of the outcome in a `UsecaseResult<TOutput, Error>` — thrown errors never reach the caller

Use it for operations that need observability, a uniform error contract, or cancellation — typically user- or system-initiated requests.

### `ServiceBase` — lightweight application component

A base class for shared business logic and lightweight entry points. It only provides dependency injection for infrastructure ports (`clock`, `logger`, `metrics`) with sensible defaults — no operation lifecycle of its own.

Use it for:

- **Shared business logic** composed by multiple use cases
- **Lightweight entry points** without tracking overhead: scheduled jobs, event handlers, CLI commands
- **Stateful components** that maintain data between calls

### When to use what

| You need                                            | Use           |
| --------------------------------------------------- | ------------- |
| Execution IDs, duration metrics, cancellation       | `Usecase`     |
| A uniform `UsecaseResult` error contract            | `Usecase`     |
| Logic shared across multiple entry points           | `ServiceBase` |
| Jobs, event handlers, CLI without tracking overhead | `ServiceBase` |
| Stateful business components                        | `ServiceBase` |

Both strategies keep the application layer framework-agnostic: they depend on **ports**, never on concrete infrastructure. Default adapters (console logging, system clock, no-op metrics) work out of the box — inject your own implementations for testing or observability. They also share one base: `Usecase` extends `ServiceBase`, so the two strategies differ in lifecycle, not in kind.

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

The repository uses Bun for local development and CI validation, while the actual package release flow is managed through the GitHub Actions release workflow and Changesets.

Quick commands:

- `bun run changeset` - Create a changeset for a package

Releases are run from the GitHub Actions **Release** workflow (`RC` → `rc`, `Release` → `latest`).
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
