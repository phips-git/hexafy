# Agent Configuration

Use this file as the entry point for agent-facing guidance in this repository.

## Documentation

- **[.agents/CODESTYLE.md](./.agents/CODESTYLE.md)** - Error classes, naming, use case patterns, NestJS integration
- **[.agents/PROJECT-STRUCTURE.md](./.agents/PROJECT-STRUCTURE.md)** - Package layout, import/export patterns, domain primitives
- **[.agents/QUICKSTART.md](./.agents/QUICKSTART.md)** - Commands, workflow, build/publish details
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - PR process, changesets, release workflow

## Core Architecture

- **Hexagonal architecture**: Domain is independent; application and infrastructure layers depend on it
- **Use Cases**: Extend `Usecase<TInput, TOutput>` from `@hexafy/core/application`; use `ServiceBase` for shared application logic
- **Domain primitives**: `Entity`, `ValueObject`, `AggregateRoot`, `RepositoryBase`, and `UnitOfWorkBase` from `@hexafy/core/domain`
- **Ports**: Define interfaces in `domain/ports` or application ports, and implement adapters in `infrastructure/adapters`
- **Errors**: Expected business failures become `UsecaseResult` failures via `failure(...)`; unexpected infrastructure errors should throw at the boundary
- **Package API**: `@hexafy/core/application` for `Usecase`, `ServiceBase`, `success/failure/unwrap`; `@hexafy/core/domain` for domain types/errors; `@hexafy/core/infrastructure` for adapters

## Guidelines

- **Self-explanatory code**: Clear names, no unnecessary comments
- **Type safety**: No `any` types; use proper generics and type guards (`isSuccess`/`isFailure`)
- **Direct imports**: Prefer package subpaths (`@hexafy/core/application`, `@hexafy/core/domain`, `@hexafy/core/infrastructure`); avoid convenience re-exports
- **Result handling**: Always check `result.success` before accessing `result.value`; use `unwrap()` only when failure is unexpected
- **Cancellation**: Pass `CancellationToken` to long-running use cases
- **Logging**: Use the provided `LoggingPort` with execution context; log business events, not error details

## Development Commands

```bash
bun install
bun run typecheck
bun run test
bun run lint --fix
```

See [QUICKSTART.md](./.agents/QUICKSTART.md) for build/publish workflow and changeset process.

## Domain Adapters

- `@hexafy/aws-lambda` - Lambda API Gateway adapter
- `@hexafy/email` - Email domain (SendGrid/SMTP)
- `@hexafy/object-storage` - S3 with NoOp test adapter
