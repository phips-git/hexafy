# Agent Configuration

Use this file as the entry point for agent-facing guidance in this repository.

## Documentation

- **[.agents/CODESTYLE.md](./.agents/CODESTYLE.md)** - Coding conventions, error handling, naming, port injection
- **[.agents/PROJECT-STRUCTURE.md](./.agents/PROJECT-STRUCTURE.md)** - Package layout, import/export patterns, README standards
- **[.agents/QUICKSTART.md](./.agents/QUICKSTART.md)** - Commands, workflow, build/publish details
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - PR process, changesets, release workflow

All instructions in these referenced documents above are mandatory. Agents must follow them as source of truth.

## Core Architecture

- **Hexagonal architecture**: Domain is independent; application and infrastructure layers depend on it
- **Use Cases**: Extend `UseCase<TInput, TOutput>` from `@hexafy/core/application`; use `ServiceBase` for shared application logic
- **Domain primitives**: `Entity`, `ValueObject`, `AggregateRoot`, `RepositoryBase`, `UnitOfWorkBase` from `@hexafy/core/domain`
- **Ports**: Define interfaces in `domain/ports` or application ports, implement adapters in `infrastructure/adapters`
- **Errors**: See [CODESTYLE.md#errors](./.agents/CODESTYLE.md#errors); throw typed domain errors in `executeInternal`
- **Package API**: `@hexafy/core/application` for use cases, `@hexafy/core/domain` for domain types, `@hexafy/core/infrastructure` for adapters

## Guidelines

- Follow patterns in [CODESTYLE.md](./.agents/CODESTYLE.md) for naming, error handling, port injection
- Use canonical references from [PROJECT-STRUCTURE.md](./.agents/PROJECT-STRUCTURE.md#drift-resistant-references) to avoid documentation drift
- Always check `result.success` before accessing `result.value`
- Use injected `LoggingPort` in `UseCase.executeInternal` and `ServiceBase` methods
