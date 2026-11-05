# @hexafy/core

A small, opinionated toolkit for building hexagonal architecture applications in TypeScript.

This package gives you the core building blocks for domain logic, application use cases, repositories, and error handling without bringing in a framework.

## What it includes

- `Usecase` base class for application logic
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
import { ValidationError, type LoggerPort } from '@hexafy/core/domain';

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

- business logic lives in a `Usecase`
- the use case returns a value on success
- thrown errors are converted into a failed `UsecaseResult`
- infrastructure concerns stay outside the domain layer

Example:

```ts
import { success, failure } from '@hexafy/core/application';

const ok = success({ id: '1' });
const bad = failure(new Error('Something went wrong'));

if (ok.success) {
  console.log(ok.value.id);
}
```

## Package layout

This package exposes focused subpaths:

```ts
import { Usecase, success, failure } from '@hexafy/core/application';
import {
  ApplicationError,
  ValidationError,
  RepositoryBase,
  type RepositoryPort,
  type LoggerPort
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
