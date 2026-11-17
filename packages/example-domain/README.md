# @hexafy/example-domain

Reference domain package showing how to structure a real hexagonal domain on top of `@hexafy/core`.

## Why this package exists

This package is a learning/reference implementation for the Hexafy package family.  
It demonstrates how to organize application, domain, and infrastructure layers with realistic auth and task-management flows.

It provides:

- application use cases for auth and task management
- domain models, ports, policies, and validators
- in-memory adapters for local development/testing

## Installation

```bash
bun install
```

This package is workspace-private and intended as an internal example.

Use subpath imports:

- `@hexafy/example-domain/application`
- `@hexafy/example-domain/domain`
- `@hexafy/example-domain/infrastructure`

## Quick start

```ts
import {
  AuthenticateUseCase,
  CompleteTaskUseCase,
  CreateTaskUseCase,
  CreateUseCase
} from '@hexafy/example-domain/application';
import {
  InMemoryProjectRepository,
  InMemoryTaskRepository,
  InMemoryUserRepository
} from '@hexafy/example-domain/infrastructure';

// Create repositories
const userRepository = new InMemoryUserRepository();
const taskRepository = new InMemoryTaskRepository();
const projectRepository = new InMemoryProjectRepository();

// Create auth use cases
const createUser = new CreateUseCase(userRepository);
const authenticate = new AuthenticateUseCase(userRepository);

// Create task management use cases
const createTask = new CreateTaskUseCase(taskRepository, {
  logger: console
});
const completeTask = new CompleteTaskUseCase(taskRepository);

// Execute use cases
const createResult = await createUser.execute({
  email: 'user@example.com',
  password: 'password123',
  name: 'John Doe'
});

if (createResult.success) {
  console.log('User created:', createResult.value.user.email);
}
```

## Public API at a glance

```ts
import {
  AuthenticateUseCase,
  type AuthenticateUseCaseInput,
  type AuthenticateUseCaseOutput,
  type CompleteTaskInput,
  type CompleteTaskOutput,
  CompleteTaskUseCase,
  CreateTaskUseCase,
  type CreateTaskUseCaseInput,
  CreateUseCase
} from '@hexafy/example-domain/application';
import {
  AuthenticationPort,
  Project,
  ProjectId,
  ProjectPort,
  Task,
  TaskId,
  TaskListItem,
  TaskPort,
  User,
  UserId,
  UserPort,
  UserRole
} from '@hexafy/example-domain/domain';
import {
  InMemoryAuthenticationAdapter,
  InMemoryProjectRepository,
  InMemoryTaskRepository,
  InMemoryUserRepository
} from '@hexafy/example-domain/infrastructure';
```

## Exported artifacts and usage

| Export                                                 | Entry point                              | What it is for                             | When to use                             | Minimal usage                             |
| ------------------------------------------------------ | ---------------------------------------- | ------------------------------------------ | --------------------------------------- | ----------------------------------------- |
| `CreateUseCase`, `AuthenticateUseCase`                 | `/application/auth/use-cases`            | Reference auth use case implementations    | User registration and authentication    | Instantiate with `InMemoryUserRepository` |
| `CreateTaskUseCase`, `CompleteTaskUseCase`             | `/application/task-management/use-cases` | Reference task management use cases        | Task CRUD operations                    | Instantiate with `InMemoryTaskRepository` |
| `User`, `UserId`, `TenantId`, `UserRole`               | `/domain/auth/models`                    | Auth bounded-context model contracts       | Auth/domain typing                      | Use in auth use case/port contracts       |
| `AuthenticationPort`, `UserPort`                       | `/domain/auth/ports`                     | Auth persistence/authentication boundaries | Invert auth infrastructure dependencies | Implement in infrastructure adapters      |
| `Task`, `TaskId`, `TaskListItem`                       | `/domain/task-management/models`         | Task aggregate model and types             | Task operations                         | Use as task use case IO/types             |
| `TaskPriority`, `TaskStatus`                           | `/domain/task-management/models`         | Task lifecycle enums                       | Constrained task state and priority     | Use constants in policies and validation  |
| `TaskCreationProperties`, `TaskUpdateProperties`       | `/domain/task-management/models`         | Task mutation typing                       | Task creation/update flows              | Use as create/update parameters           |
| `Project`, `ProjectId`                                 | `/domain/task-management/models`         | Project aggregate model                    | Project operations                      | Use as project use case types             |
| `ProjectCreationProperties`, `ProjectUpdateProperties` | `/domain/task-management/models`         | Project mutation typing                    | Project creation/update flows           | Use as create/update parameters           |
| `TaskStatusPolicy`                                     | `/domain/task-management/policies`       | Business rule policy objects               | State transition validation             | Call from use case operations             |
| `TaskPort`, `ProjectPort`                              | `/domain/task-management/ports`          | Task/project persistence boundaries        | Invert task-management infrastructure   | Implement in infrastructure adapters      |
| `InMemoryUserRepository`                               | `/infrastructure`                        | In-memory user persistence adapter         | Local tests and example wiring          | Construct and inject into use cases       |
| `InMemoryTaskRepository`                               | `/infrastructure`                        | In-memory task persistence adapter         | Local tests and example wiring          | Construct and inject into use cases       |
| `InMemoryProjectRepository`                            | `/infrastructure`                        | In-memory project persistence adapter      | Local tests and example wiring          | Construct and inject into use cases       |
| `InMemoryAuthenticationAdapter`                        | `/infrastructure`                        | In-memory authentication adapter           | Auth flow testing                       | Use with `InMemoryUserRepository`         |

## How it fits with `@hexafy/core`

- **Application layer**: Use cases extend `@hexafy/core/application/Usecase` for built-in timeout, cancellation, and metrics support
- **Domain layer**: Entities use `@hexafy/core/domain` primitives like `Brand`, `Entity`, and `AggregateRoot`
- **Infrastructure layer**: Adapters implement domain ports defined in `@hexafy/example-domain/domain`
- **Error handling**: Use `@hexafy/core/domain` error types like `NotFoundError`, `ValidationError`

## Use case patterns

### Simple use cases (no core Usecase base)

For simple operations that don't need the full use case lifecycle:

```ts
import { CreateUseCase } from '@hexafy/example-domain/application';

const useCase = new CreateUseCase(userPort);
const result = await useCase.execute({ email, password, name });

if (result.success) {
  // use result.value
} else {
  // handle result.error
}
```

### Full use cases (extend Usecase base)

For operations needing timeout, cancellation, and metrics:

```ts
import { CreateTaskUseCase } from '@hexafy/example-domain/application';

const useCase = new CreateTaskUseCase(taskPort, {
  logger: consoleLogger,
  timeoutMs: 5000
});
const result = await useCase.execute(input);

if (result.success) {
  // use result.value (Task)
} else {
  // handle result.error (Error)
}
```

## Recommended usage

- Treat this package as a reference implementation, not production-ready domain logic
- Reuse the structure and dependency flow in real packages
- Swap in-memory adapters for real adapters at infrastructure boundaries
- Follow the pattern: ports in domain, adapters in infrastructure, use cases in application

## License

MIT
