# @hexafy/core

Core hexagonal architecture primitives for TypeScript: use cases, domain building blocks, and infrastructure ports/adapters.

## Why this package exists

`@hexafy/core` is the foundation of the Hexafy package family. It keeps business logic framework-agnostic and provides:

- Application orchestration (`Usecase`, `ServiceBase`)
- Use-case outcome contract (`UsecaseResult`)
- Domain errors and primitives (`ApplicationError`, `Entity`, `AggregateRoot`, `ValueObject`)
- Cross-cutting ports and default adapters (logging, metrics, clock, identifier)

## Architecture overview

This package implements [hexagonal (ports-and-adapters) architecture](https://alistair.cockburn.us/hexagonal-architecture/) to keep your business logic independent of frameworks, databases, and external services.

### Benefits

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Frameworks / Databases / External                 │
│                        (can change freely)                           │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ implements
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Application Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Usecase    │  │  Service     │  │   Ports      │              │
│  │   Base       │  │   Base       │  │  (interfaces)│              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────┬───────────────────────────────────────────────┘
                      │ depends on
                      │
┌─────────────────────▼───────────────────────────────────────────────┐
│                         Domain Layer                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │    Entity    │  │   Repository │  │    Errors    │              │
│  │  primitives  │  │    Ports     │  │  (typed)     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                         ◄───── CORE ─────►                          │
└─────────────────────────────────────────────────────────────────────┘

Key benefits:
• Domain logic is framework-agnostic and easily testable
• Swap infrastructure (database, email provider, etc.) without touching business rules
• Clear boundaries: ports define contracts, adapters implement them
```

**Rule:** Dependencies flow inward. Infrastructure depends on Application (implements ports), Application depends on Domain (uses primitives). Domain has no dependencies.

## Installation

```bash
npm install @hexafy/core
# or
bun add @hexafy/core
# or
yarn add @hexafy/core
```

## Quick start

```ts
import {
  type LoggingPort,
  Usecase,
  type UsecaseConfiguration
} from '@hexafy/core/application';
import { ValidationError } from '@hexafy/core/domain';

interface CreateUserInput {
  email: string;
  name: string;
}
interface User {
  id: string;
  email: string;
  name: string;
}

class CreateUserUseCase extends Usecase<CreateUserInput, User> {
  constructor(config?: UsecaseConfiguration) {
    super(config);
  }

  protected async executeInternal(
    input: CreateUserInput,
    logger: LoggingPort,
    signal?: AbortSignal
  ): Promise<User> {
    if (!input.email.includes('@')) {
      throw new ValidationError('Invalid email');
    }
    logger.info('User created', { email: input.email });
    return { id: 'user_123', email: input.email, name: input.name };
  }
}

const useCase = new CreateUserUseCase();
const result = await useCase.execute({
  email: 'user@example.com',
  name: 'John'
});

if (result.success) {
  console.log('User:', result.value);
} else {
  console.error('Failed:', result.error);
}
```

## Best practices

- Keep business rules in domain/application layers; framework details in infrastructure adapters
- Use `UseCase` for operation boundaries and `ServiceBase` for reusable services
- In `executeInternal`, return plain output for success; throw typed domain errors for business failures
- Handle outcomes via `result.success` at `execute()` call sites
- For long-running operations, periodically check `signal?.throwIfAborted()` to support cancellation
- Import from explicit subpaths (`@hexafy/core/application`, `/domain`, `/infrastructure`)

## Cancellation and timeouts

Use case execution supports cancellation via `AbortSignal` and automatic timeouts via `timeoutMs` configuration.

### Cancellation

Pass an `AbortSignal` to cancel long-running operations:

```ts
const controller = new AbortController();

// Start execution with cancellation support
const result = await useCase.execute(input, { signal: controller.signal });

// Cancel the operation from elsewhere
controller.abort();

// Or abort with a custom reason
controller.abort(new Error('User requested cancellation'));
```

When cancelled, `execute()` returns a `UsecaseCancelledError`:

```ts
if (!result.success && result.error instanceof UsecaseCancelledError) {
  // Handle cancellation (e.g., return 499 to client)
}
```

**Tip**: For long-running `executeInternal` implementations, periodically check for cancellation:

```ts
protected async executeInternal(
  input: TransferInput,
  logger: LoggingPort,
  signal?: AbortSignal
): Promise<void> {
  // Check cancellation at safe points
  signal?.throwIfAborted();
  
  // ... long-running work
  
  signal?.throwIfAborted();
  // ... more work
}
```

### Timeouts

Configure a timeout in the use case constructor:

```ts
const useCase = new TransferFundsUseCase({
  timeoutMs: 10000 // 10 second timeout
});

const result = await useCase.execute(input);

if (result.error instanceof UsecaseTimeoutError) {
  // Handle timeout
}
```

The timeout is implemented via `setTimeout` + `AbortController`. When the timeout expires, the use case returns a `UsecaseTimeoutError`.

### Combining cancellation and timeouts

Both work together: if you pass a `signal` and configure `timeoutMs`, the use case responds to either cancellation source:

```ts
const controller = new AbortController();
const useCase = new LongRunningUseCase({ timeoutMs: 5000 });

const result = await useCase.execute(input, { signal: controller.signal });
// Returns UsecaseTimeoutError after 5s OR UsecaseCancelledError if controller.abort() is called
```

## Error handling model

`Usecase.execute(...)` returns a `UsecaseResult` and never relies on raw thrown exceptions. It separates two failure types:

1. **Domain/business failures** – validation, conflict, not found, authorization violations thrown in `executeInternal`; returned unchanged in `result.error`
2. **Execution-boundary failures** – cancellation and timeout represented by `UsecaseCancelledError` and `UsecaseTimeoutError`

Domain errors preserve their type identity. Wrapper failures are explicit for easy narrowing:

```ts
import {
  UsecaseCancelledError,
  UsecaseTimeoutError
} from '@hexafy/core/application';

const result = await useCase.execute(input, { signal });

if (!result.success) {
  if (result.error instanceof UsecaseCancelledError) {
    // map to transport/client-cancel semantics
  } else if (result.error instanceof UsecaseTimeoutError) {
    // map to timeout semantics
  } else {
    // domain/application error from executeInternal
  }
}
```

## Public API

Three subpath entry points:

- `@hexafy/core/application` – `Usecase`, `ServiceBase`, `UsecaseResult`, ports, configuration
- `@hexafy/core/domain` – Domain primitives, errors, repository ports
- `@hexafy/core/infrastructure` – Default adapters (logging, clock, metrics, identifier)

See the [Exported artifacts and usage](#exported-artifacts-and-usage) table below for complete details.

## Exported artifacts and usage

| Export                                                                                                                                                     | Entry point       | What it is for                                                           | When to use                                                                                     | Minimal usage                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `Usecase`, `UseCaseConfiguration`                                                                                                                          | `/application`    | Execution lifecycle, timeouts, cancellation                              | One business operation with result contract                                                     | `class X extends Usecase<I, O> { ... }`                                             |
| `UsecaseExecutionOptions`                                                                                                                                  | `/application`    | Per-execution context and cancellation options                           | Passing execution metadata and `AbortSignal`                                                    | `useCase.execute(input, { executionContext, signal })`                              |
| `ServiceBase`, `ServiceConfiguration`                                                                                                                      | `/application`    | Shared app logic without full use case lifecycle                         | Reusable services used by multiple use cases                                                    | `class PricingService extends ServiceBase { ... }`                                  |
| `UsecaseResult`                                                                                                                                            | `/application`    | Typed success/failure result contract returned by `Usecase.execute(...)` | Handling use case outcomes at call sites                                                        | `const result = await useCase.execute(input)`                                       |
| `UsecaseCancelledError`, `UsecaseTimeoutError`                                                                                                             | `/application`    | Wrapper-owned execution failures and failure narrowing                   | Handling cancellation and timeout failures                                                      | `if (!result.success && result.error instanceof UsecaseTimeoutError) { ... }`       |
| `ClockPort`, `IdentifierPort`, `LoggingPort`, `MetricsPort`                                                                                                | `/application`    | Boundary contracts for cross-cutting concerns                            | Invert infrastructure dependencies in app layer                                                 | Depend on interfaces, inject adapters                                               |
| `ApplicationError`                                                                                                                                         | `/domain`         | Base application error class                                             | Custom error hierarchies and error handling                                                     | `class MyError extends ApplicationError { ... }`                                    |
| Domain error classes (`ValidationError`, `NotFoundError`, `ConflictError`, `UnauthorizedError`, `ForbiddenError`, `InvariantError`, `InfrastructureError`) | `/domain`         | Standardized, typed error model                                          | Expected business and boundary failures                                                         | `throw new ValidationError('...')`                                                  |
| `isDomainError`, `getDomainErrorCode`, `DomainErrorLike`                                                                                                   | `/domain`         | Domain-error narrowing and metadata extraction                           | Boundary code (exception filters, handlers) for distinguishing domain vs. infrastructure errors | `if (isDomainError(err)) { return { status: 400, code: getDomainErrorCode(err) } }` |
| `ApplicationErrorOptions`, `ApplicationErrorDetails`                                                                                                       | `/domain`         | Error construction metadata typing                                       | Custom error subclasses and factories                                                           | Pass options to `ApplicationError` subclass                                         |
| `Entity`, `AggregateRoot`, `ValueObject`, `UniqueIdentifier`, `Brand`                                                                                      | `/domain`         | DDD-oriented domain primitives and type branding                         | Rich domain model boundaries                                                                    | Extend primitives in domain models                                                  |
| `RepositoryBase`, `RepositoryPort`                                                                                                                         | `/domain`         | Persistence abstraction contracts/bases                                  | Domain persistence ports and adapters                                                           | Implement `RepositoryPort` in infrastructure                                        |
| `UnitOfWorkBase`                                                                                                                                           | `/domain`         | Transaction boundary abstraction                                         | Multi-step persistence transactions                                                             | Extend in persistence adapters                                                      |
| `SystemClockAdapter`, `SystemIdentifierAdapter`                                                                                                            | `/infrastructure` | Default clock and id providers                                           | Production defaults without custom implementations                                              | Inject adapter constants in config                                                  |
| `ConsoleLoggingAdapter`, `JSONConsoleLoggingAdapter`, `NoOpLoggingAdapter`                                                                                 | `/infrastructure` | Built-in logging adapters                                                | Console logging, JSON logging, or silent logging                                                | Use in `UsecaseConfiguration.logging`                                               |
| `NoOpMetricsAdapter`                                                                                                                                       | `/infrastructure` | No-op metrics implementation                                             | Disable metrics while keeping port contract                                                     | Inject as default metrics adapter                                                   |

`AbortSignal` is a platform type (not a package export) used by `UsecaseExecutionOptions.signal` for cancellation-aware executions.

## License

MIT
