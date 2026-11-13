# @hexafy/core

Hexafy provides a lightweight foundation for hexagonal architecture in TypeScript, helping teams build cleaner, more testable business logic without reinventing the basics.

If you’re new to hexagonal architecture, see the Key concepts section below.

## Why this package exists

Hexafy gives you the core building blocks for hexagonal architecture applications without forcing a framework or a large app scaffold.

It keeps responsibilities explicit and gives you:

- `Usecase` for commands and queries with execution tracking and result wrapping
- `ServiceBase` for shared application logic and lightweight entry points
- `UsecaseResult` helpers: `success`, `failure`, `unwrap`, `isSuccess`, and `isFailure`
- domain errors such as `ValidationError`, `NotFoundError`, `ConflictError`, `ForbiddenError`, and `ApplicationError`
- repository and unit-of-work base abstractions
- ports and adapters for clocks, identifiers, logging, and metrics
- domain primitives such as `Entity`, `AggregateRoot`, `ValueObject`, and `UniqueIdentifier`

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
import { Usecase, type UsecaseConfiguration } from '@hexafy/core/application';
import { type LoggerPort, ValidationError } from '@hexafy/core/domain';

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
    logger: LoggerPort
  ): Promise<User> {
    if (!input.email.includes('@')) {
      throw new ValidationError('Invalid email');
    }

    logger.info('User created', { email: input.email });

    return {
      id: 'user_123',
      email: input.email,
      name: input.name
    };
  }
}

const result = await new CreateUserUseCase().execute({
  email: 'john@example.com',
  name: 'John'
});

if (result.success) {
  console.log(result.value);
} else {
  console.error(result.error.message);
}
```

## Public API at a glance

Use the package through the public entry points below:

```ts
import {
  type CancellationToken,
  failure,
  ServiceBase,
  success,
  Usecase,
  type UsecaseConfiguration,
  type UsecaseResult,
  type UsecaseRetryConfiguration
} from '@hexafy/core/application';
import {
  AggregateRoot,
  ApplicationError,
  Entity,
  RepositoryBase,
  type RepositoryPort,
  UnitOfWorkBase,
  ValidationError,
  ValueObject
} from '@hexafy/core/domain';
import {
  ConsoleLoggingAdapter,
  NoOpLoggingAdapter,
  NoOpMetricsAdapter,
  SystemClockAdapter,
  SystemIdentifierAdapter
} from '@hexafy/core/infrastructure';
```

The package intentionally keeps the API small and framework-agnostic. Domain rules stay in the domain layer; application orchestration stays in `Usecase` and `ServiceBase`; infrastructure concerns stay at the edges.

## Recommended project layout

A practical default for projects using this package looks like this:

```text
src/
  domain/
    user/
      models/
        user.ts
        user-id.ts
      policies/
        user.policies.ts
      validators/
        user.validators.ts
      ports/
        user-repository.port.ts

  application/
    user/
      usecases/
        create-user.usecase.ts
        authenticate.usecase.ts

  infrastructure/
    user/
      adapters/
        in-memory-user.repository.ts
        postgres-user.repository.ts
```

This keeps the domain model and rules together, while the application layer focuses on orchestration and the infrastructure layer holds concrete implementations. It is a practical pattern, not a rigid requirement.

## Core pattern

The package follows a simple flow:

- a command or query enters through a `Usecase` or `ServiceBase`
- business logic runs against domain objects and ports
- success returns a value
- expected failures become domain errors and are surfaced through `UsecaseResult`
- infrastructure details stay outside the application layer

This is intentionally conservative: no framework lock-in, no hidden side effects, and no implicit business behavior beyond the execution lifecycle.

## `Usecase` vs `ServiceBase`

Usecases stay conservative by default: timeout and retry are opt-in execution policies for slow or flaky boundary calls, not implicit business logic behavior.

```ts
const result = await new CreateUserUseCase({
  timeoutMs: 2000,
  retry: {
    attempts: 3,
    delayMs: 150,
    backoffMs: 150,
    shouldRetry: (error) =>
      error instanceof Error && /timeout|temporar|429|503/i.test(error.message)
  }
}).execute({ email: 'john@example.com', name: 'John' });
```

### Cancellation, timeouts, and retries

`Usecase.execute(input, context?, cancellationToken?)` supports cooperative cancellation for request-scoped flows. Use it when the surrounding runtime already knows a request is aborted or timed out.

```ts
import { type CancellationToken, Usecase } from '@hexafy/core/application';

const controller = new AbortController();
const token: CancellationToken = {
  isCancelled: controller.signal.aborted,
  reason: controller.signal.reason ?? undefined
};

const result = await new RefreshUserSession({
  timeoutMs: 1500,
  retry: { attempts: 3, delayMs: 100, backoffMs: 200 }
}).execute({ userId: 'user_123' }, { requestId: 'req_42' }, token);
```

Best practices:

- prefer adapter-native timeout and cancellation for HTTP, DB, and queue clients
- keep `retry` small and explicit
- retry only safe or idempotent operations
- fail fast on validation and domain errors

`timeoutMs` and `retry` are opt-in execution policies for slow or flaky boundary calls, not business logic.

### `Usecase`

Use `Usecase` for a single operation that needs:

- execution IDs and duration tracking
- a uniform result contract
- cancellation support
- structured logging and metrics

```ts
import { Usecase } from '@hexafy/core/application';
import { ValidationError } from '@hexafy/core/domain';

class CreateUser extends Usecase<{ email: string }, { userId: string }> {
  protected async executeInternal(input: { email: string }) {
    if (!input.email.includes('@')) {
      throw new ValidationError('Invalid email');
    }

    return { userId: 'u_123' };
  }
}
```

### `ServiceBase`

Use `ServiceBase` when you want reusable application logic without the full operation lifecycle.

```ts
import { ServiceBase } from '@hexafy/core/application';

class PricingService extends ServiceBase {
  constructor(private readonly productRepo: ProductRepository) {
    super();
  }

  async totalFor(cart: Cart): Promise<Money> {
    return Money.zero();
  }
}
```

## Result handling

The package prefers explicit results over unstructured exceptions for expected business failures.

```ts
import { failure, success } from '@hexafy/core/application';

const ok = success({ id: '1' });
const bad = failure(new Error('Something went wrong'));

if (ok.success) {
  console.log(ok.value.id);
}
```

## Package layout

The public entry points are intentionally small:

```ts
import {
  failure,
  ServiceBase,
  success,
  Usecase
} from '@hexafy/core/application';
import {
  ApplicationError,
  Entity,
  type LoggerPort,
  RepositoryBase,
  type RepositoryPort,
  ValidationError
} from '@hexafy/core/domain';
import {
  ConsoleLoggingAdapter,
  NoOpLoggingAdapter,
  NoOpMetricsAdapter
} from '@hexafy/core/infrastructure';
```

## Recommended usage

- keep domain rules and validation close to the domain or use case
- let infrastructure throw unexpected exceptions at the boundary
- use domain errors for expected business failures
- keep adapters at the edges of the system
- prefer explicit ports over framework-specific abstractions

## Key concepts

- **Domain**: business rules, entities, policies, validation, and core logic
- **Application**: use cases and orchestration logic that coordinates domain behavior
- **Infrastructure**: implementations for persistence, HTTP, logging, external APIs, and other technical concerns
- **Port**: a contract that the application or domain depends on
- **Adapter**: the concrete implementation of a port
- **Use case**: a single application operation, such as creating a user or authenticating a session
- **Boundary**: the explicit separation between business logic and external concerns

## License

MIT
