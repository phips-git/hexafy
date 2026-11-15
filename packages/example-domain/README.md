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
import { CreateUseCase } from '@hexafy/example-domain/application';
import { InMemoryUserRepository } from '@hexafy/example-domain/infrastructure';

const users = new InMemoryUserRepository();
const usecase = new CreateUseCase(users);
```

## Public API at a glance

```ts
import {
  AuthenticateUseCase,
  CompleteTaskUseCase,
  CreateTaskUseCase,
  CreateUseCase
} from '@hexafy/example-domain/application';
import {
  AuthenticationPort,
  Project,
  ProjectPort,
  Task,
  TaskPort,
  User,
  UserPort
} from '@hexafy/example-domain/domain';
import {
  InMemoryAuthenticationAdapter,
  InMemoryProjectRepository,
  InMemoryTaskRepository,
  InMemoryUserRepository
} from '@hexafy/example-domain/infrastructure';
```

## Exported artifacts and usage

| Export                                                                                                                                           | Entry point       | What it is for                                    | When to use                                        | Minimal usage                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- | ------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------- |
| `CreateUseCase`, `AuthenticateUseCase`, `CreateTaskUseCase`, `CompleteTaskUseCase`                                                               | `/application`    | Reference use-case implementations                | Learning and internal example composition          | Instantiate with in-memory adapters            |
| `User`, `UserId`, `TenantId`, `UserRole`                                                                                                         | `/domain`         | Auth bounded-context model contracts              | Auth/domain typing                                 | Use in auth use-case/port contracts            |
| `AuthenticationPort`, `UserPort`                                                                                                                 | `/domain`         | Auth persistence/authentication boundaries        | Invert auth infrastructure dependencies            | Implement in infrastructure adapters           |
| `AuthorizationContext`, `extractTenantId`, `extractUserId`                                                                                       | `/domain`         | Authorization context model and helper extractors | Tenant/user context-aware task flows               | Use in task authorization checks               |
| `Task`, `TaskId`, `TaskListItem`, `TaskCreationProperties`, `ValidTaskCreationProperties`, `TaskUpdateProperties`, `ValidTaskUpdateProperties`   | `/domain`         | Task aggregate model and mutation typing          | Task creation/update flows                         | Use as task use-case IO/types                  |
| `TaskPriority`, `TaskStatus`                                                                                                                     | `/domain`         | Task lifecycle enums/constants                    | Constrained task state and priority values         | Use constants/types in policies and validation |
| `Project`, `ProjectId`, `ProjectCreationProperties`, `ValidProjectCreationProperties`, `ProjectUpdateProperties`, `ValidProjectUpdateProperties` | `/domain`         | Project aggregate model and mutation typing       | Project creation/update flows                      | Use as project use-case IO/types               |
| `Tenant`, `TenantCreationProperties`, `ValidTenantCreationProperties`                                                                            | `/domain`         | Tenant model contracts                            | Multi-tenant task-management flows                 | Use in tenant-aware operations                 |
| `TaskStatusPolicy`, `ProjectPolicy`                                                                                                              | `/domain`         | Business rule policy objects                      | State transition and authorization rules           | Call from use-case/domain operations           |
| `TaskValidators`, `ProjectValidators`                                                                                                            | `/domain`         | Input/state validation helpers                    | Guard creation/update operations                   | Validate before persistence                    |
| `TaskPort`, `ProjectPort`, `ProjectStats`, `ProjectStatsPort`                                                                                    | `/domain`         | Task/project persistence boundaries               | Invert task-management infrastructure dependencies | Implement in infrastructure adapters           |
| `InMemoryUserRepository`, `InMemoryAuthenticationAdapter`, `InMemoryTaskRepository`, `InMemoryProjectRepository`                                 | `/infrastructure` | In-memory adapter implementations                 | Local tests and example app wiring                 | Construct and inject into use cases            |

## How it fits with `@hexafy/core`

- Uses `@hexafy/core` as the base for use-case lifecycle, typing, and error contracts
- Demonstrates companion package integration patterns without redefining core primitives
- Serves as a reference for package-family layering conventions

## Recommended usage

- Treat this package as a reference implementation, not production-ready domain logic
- Reuse the structure and dependency flow in real packages
- Swap in-memory adapters for real adapters at infrastructure boundaries

## License

MIT
