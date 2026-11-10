# Agent Configuration

Use this file as the entry point for agent-facing guidance in this repository.

## Documentation

- **[.agents/CODESTYLE.md](./.agents/CODESTYLE.md)** - Error classes, naming, use case patterns, NestJS integration
- **[.agents/PROJECT-STRUCTURE.md](./.agents/PROJECT-STRUCTURE.md)** - Package layout, import/export patterns, domain primitives
- **[.agents/QUICKSTART.md](./.agents/QUICKSTART.md)** - Commands, workflow, build/publish details
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - PR process, changesets, release workflow

## Core Architecture

- **Hexagonal architecture**: Domain is independent; application and infrastructure layers depend on it
- **Use Cases**: Extend `Usecase<TInput, TOutput>` base class from `@hexafy/core/application`
- **Domain primitives**: `Entity`, `ValueObject`, `AggregateRoot` from `@hexafy/core/domain`
- **Ports**: Define interfaces in `domain/ports`; implement adapters in `infrastructure/adapters`
- **Errors**: Domain errors return via `Result` (`success`/`failure`); infrastructure errors throw

## Guidelines

- **Self-explanatory code**: Clear names, no unnecessary comments
- **Type safety**: No `any` types; use proper generics and type guards (`isSuccess`/`isFailure`)
- **Direct imports**: Import from source subpaths (e.g., `@hexafy/core/application`), not barrel exports
- **Result handling**: Always check `result.success` before accessing value; use `unwrap()` only when failure is unexpected
- **Cancellation**: Pass `CancellationToken` to long-running use cases
- **Logging**: Use provided `LoggerPort` with execution context; log business events, not error details

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
