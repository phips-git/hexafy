# Agent Configuration

Use this file as the entry point for agent-facing guidance in this repository.

## Documentation

- **[.agents/CODESTYLE.md](./.agents/CODESTYLE.md)** - Error classes, naming, use case patterns, NestJS integration
- **[.agents/PROJECT-STRUCTURE.md](./.agents/PROJECT-STRUCTURE.md)** - Package layout, import/export patterns, domain primitives
- **[.agents/QUICKSTART.md](./.agents/QUICKSTART.md)** - Commands, workflow, build/publish details
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - PR process, changesets, release workflow

All instructions in these referenced documents above are mandatory. Agents must follow them as source of truth.

## Core Architecture

- **Hexagonal architecture**: Domain is independent; application and infrastructure layers depend on it
- **Use Cases**: Extend `UseCase<TInput, TOutput>` from `@hexafy/core/application`; use `ServiceBase` for shared application logic
- **Domain primitives**: `Entity`, `ValueObject`, `AggregateRoot`, `RepositoryBase`, and `UnitOfWorkBase` from `@hexafy/core/domain`
- **Ports**: Define interfaces in `domain/ports` or application ports, and implement adapters in `infrastructure/adapters`
- **Errors**: See [CODESTYLE.md#errors](./.agents/CODESTYLE.md#errors); in `executeInternal`, throw typed domain errors for expected business failures
- **Package API**: `@hexafy/core/application` for `UseCase`, `ServiceBase`, `UseCaseResult`; `@hexafy/core/domain` for domain types/errors; `@hexafy/core/infrastructure` for adapters

## Guidelines

- **Self-explanatory code**: Clear names, no unnecessary comments
- **Type safety**: No `any` types; use proper generics and explicit result checks (`result.success`)
- **Drift-resistant docs**: Follow the mandatory documentation rules in `.agents/PROJECT-STRUCTURE.md` and prefer canonical references over duplicated API snippets
- **Direct imports**: Prefer package subpaths (`@hexafy/core/application`, `@hexafy/core/domain`, `@hexafy/core/infrastructure`); avoid convenience re-exports
- **Result handling**: Always check `result.success` before accessing `result.value`
- **Logging**: See [CODESTYLE.md](./.agents/CODESTYLE.md) (lines 58-62); use injected `LoggingPort` with execution context

## Domain Adapters

- `@hexafy/aws-lambda` - Lambda API Gateway adapter
- `@hexafy/email` - Email domain (SendGrid/SMTP)
- `@hexafy/object-storage` - S3 with NoOp test adapter
