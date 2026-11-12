# @hexafy/core

A small, opinionated toolkit for building hexagonal architecture applications in TypeScript.

This package gives you the core building blocks for domain logic, application use cases, repositories, and error handling without bringing in a framework.

## What it includes

- `Usecase` base class for application logic
- `ServiceBase` for shared business logic and lightweight entry points
- `UsecaseResult` helpers: `success`, `failure`, `unwrap`, `isSuccess`, `isFailure`
- domain error types such as `ValidationError`, `NotFoundError`, `ConflictError`, and `ApplicationError`
- repository and unit-of-work base abstractions
- logging, clock, identifier, and metrics ports with adapters

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
  Usecase,
  type UsecaseExecutionConfiguration
} from '@hexafy/core/application';
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
  constructor(config?: UsecaseExecutionConfiguration) {
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

const useCase = new CreateUserUseCase();
const result = await useCase.execute({
  email: 'john@example.com',
  name: 'John'
});

if (result.success) {
  console.log(result.value);
} else {
  console.error(result.error.message);
}
```

## Core pattern

The package is built around a simple application flow:

- business logic lives in a `Usecase` or `ServiceBase`
- the use case returns a value on success
- thrown errors are converted into a failed `UsecaseResult`
- infrastructure concerns stay outside the domain layer

### Entry point strategies: `Usecase` vs `ServiceBase`

In hexagonal architecture, inbound (input) ports are the entry points where external actors call into the application layer. The package offers two implementation strategies for them:

**`Usecase`** — full-featured entry point for a single operation. Automatically provides execution IDs, duration tracking, cancellation support, and wraps the outcome in a `UsecaseResult<T, Error>`. Extends `ServiceBase`, so both strategies share the same injected ports and differ only in lifecycle.

**`ServiceBase`** — lightweight component. Only provides injected infrastructure ports (`clock`, `logger`, `metrics`) with sensible defaults, no operation lifecycle:

```ts
import { ServiceBase } from '@hexafy/core/application';

class PricingService extends ServiceBase {
  constructor(private readonly productRepo: ProductRepository) {
    super();
  }

  async totalFor(cart: Cart): Promise<Money> {
    // shared logic composed by multiple use cases
  }
}
```

Use `Usecase` when an operation needs observability, a uniform error contract, or cancellation. Use `ServiceBase` for shared business logic composed by multiple use cases, lightweight entry points (jobs, event handlers, CLI) without tracking overhead, or stateful components.

Example:

```ts
import { failure, success } from '@hexafy/core/application';

const ok = success({ id: '1' });
const bad = failure(new Error('Something went wrong'));

if (ok.success) {
  console.log(ok.value.id);
}
```

## Package layout

This package exposes focused subpaths:

```ts
import {
  failure,
  ServiceBase,
  success,
  Usecase
} from '@hexafy/core/application';
import {
  ApplicationError,
  type LoggerPort,
  RepositoryBase,
  type RepositoryPort,
  ValidationError
} from '@hexafy/core/domain';
import { ConsoleLoggingAdapter } from '@hexafy/core/infrastructure';
```

## Recommended usage

- keep domain rules and validation in `Usecase` or domain types
- let infrastructure code throw unexpected exceptions
- use domain errors for expected business failures
- keep adapters on the edges of the system
- prefer small, explicit ports over framework-specific abstractions

## License

MIT
