# Hexafy

Hexafy provides lightweight foundations for building hexagonal architecture applications in TypeScript, including core architectural primitives and framework/domain-specific adapters.

This monorepo stays intentionally minimal, with clear boundaries between domain logic, application use cases, and infrastructure.

## 📦 Publishable Packages

| Package                  | Description                                                          |
| ------------------------ | -------------------------------------------------------------------- |
| `@hexafy/core`           | Core hexagonal primitives: use cases, services, repositories, errors |
| `@hexafy/nestjs`         | NestJS adapters for hexagonal applications                           |
| `@hexafy/aws-lambda`     | AWS Lambda adapters                                                  |
| `@hexafy/email`          | Email domain package with provider adapters                          |
| `@hexafy/object-storage` | Object storage package with adapter implementations                  |

## 📚 Example Applications

- **Example Domain**: `packages/example-domain/`
- **NestJS Example App**: `apps/nestjs/`
- **AWS Lambda Example App**: `apps/aws-lambda/`

## 🚀 Quick Start

```bash
bun install
bun run typecheck
bun run test
```

For package-level usage and detailed examples, start with:

- [`packages/core/README.md`](./packages/core/README.md)
- [`packages/nestjs/README.md`](./packages/nestjs/README.md)
- [`packages/aws-lambda/README.md`](./packages/aws-lambda/README.md)

## 🔧 Common Scripts

```bash
bun run typecheck
bun run test
bun run lint
bun run format
```

## 📦 Publishing

Release flow is managed through GitHub Actions + Changesets.

```bash
bun run changeset
```

Releases run from the GitHub Actions **Release** workflow (`RC` → `rc`, `Release` → `latest`).
See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for release policy details.

## 📖 Learn More

- Core: [`packages/core/README.md`](./packages/core/README.md)
- Example Domain: [`packages/example-domain/README.md`](./packages/example-domain/README.md)
- NestJS App: [`apps/nestjs/README.md`](./apps/nestjs/README.md)
- Lambda App: [`apps/aws-lambda/README.md`](./apps/aws-lambda/README.md)

## 📄 License

MIT — See [LICENSE](./LICENSE)
