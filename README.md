# Hexafy

Hexafy is a practical package family for building hexagonal TypeScript systems without reinventing the basics: start with `@hexafy/core` primitives for application and domain design, then plug in companion adapters for runtime and domain integrations (for example NestJS, AWS Lambda, observability, email or object storage).

**New to hexagonal architecture?** Start with [`packages/core/README.md`](./packages/core/README.md)

## Why this repository exists

This monorepo keeps the package family aligned around one core architecture model and consistent package structure/docs.
It also provides example apps for end-to-end integration patterns and is intended to grow with future AI skills and CLI tooling around the Hexafy ecosystem.

## Public packages at a glance

| Package                  | Purpose                                    |
| ------------------------ | ------------------------------------------ |
| `@hexafy/core`           | Core architecture primitives and contracts |
| `@hexafy/observability`  | Execution/logging observability companions |
| `@hexafy/aws-lambda`     | AWS Lambda adapter layer                   |
| `@hexafy/nestjs`         | NestJS adapter layer                       |
| `@hexafy/email`          | Email domain and provider adapters         |
| `@hexafy/object-storage` | Object-storage domain port + adapters      |

## Monorepo layout

| Path         | Purpose                                                  |
| ------------ | -------------------------------------------------------- |
| `packages/*` | Publishable package-family modules (see package READMEs) |
| `apps/*`     | Integration/example applications                         |
| `.agents/*`  | Agent-facing engineering and documentation standards     |

## Development

Required stack:

- **Bun** (version from root `package.json` `engines.bun`)
- **TypeScript** (workspace compiler/tooling)
- **Changesets** (versioning and release workflow)

Setup:

```bash
bun install
```

For commands and documentation, use the canonical sources:

- root [`package.json`](./package.json) (`scripts`)
- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [.agents/QUICKSTART.md](./.agents/QUICKSTART.md)

## License

MIT
