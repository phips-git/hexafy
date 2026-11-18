# @hexafy/example-domain

Reference domain package demonstrating hexagonal architecture with `@hexafy/core`.

## Overview

This workspace-private package provides a complete example of organizing:

- **Application layer**: Use cases for auth and task management
- **Domain layer**: Entities, ports, policies, and validators
- **Infrastructure layer**: In-memory adapters for testing

## Installation

This package is workspace-private. Import via subpaths:

- `@hexafy/example-domain/application` - Use cases and ports
- `@hexafy/example-domain/domain` - Domain models
- `@hexafy/example-domain/infrastructure` - Adapters

## Quick Start

```typescript
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

const userRepository = new InMemoryUserRepository();
const taskRepository = new InMemoryTaskRepository();
const projectRepository = new InMemoryProjectRepository();

const createUser = new CreateUseCase(userRepository);
const authenticate = new AuthenticateUseCase(userRepository);
const createTask = new CreateTaskUseCase(taskRepository);

const result = await createUser.execute({
  email: 'user@example.com',
  password: 'secret',
  name: 'John Doe'
});
```

## Exports

### Application

| Use Case              | Description         |
| --------------------- | ------------------- |
| `CreateUseCase`       | User registration   |
| `AuthenticateUseCase` | User authentication |
| `CreateTaskUseCase`   | Create tasks        |
| `CompleteTaskUseCase` | Mark tasks complete |

### Ports

- `UserPort`, `AuthenticationPort` - Auth persistence
- `TaskPort`, `ProjectPort` - Task/project persistence

### Infrastructure

- `InMemoryUserRepository` - In-memory user adapter
- `InMemoryTaskRepository` - In-memory task adapter
- `InMemoryProjectRepository` - In-memory project adapter
- `InMemoryAuthenticationAdapter` - In-memory auth adapter

## Integration with @hexafy/core

- Use cases extend `@hexafy/core/application/UseCase`
- Ports define infrastructure boundaries
- Entities use `@hexafy/core/domain` primitives
- Errors from `@hexafy/core/domain`

## Usage Pattern

```typescript
import { CreateUseCase } from '@hexafy/example-domain/application';

const useCase = new CreateUseCase(userPort);
const result = await useCase.execute(input);

if (result.success) {
  // use result.value
} else {
  // handle result.error
}
```

## Recommendations

- Use as reference implementation for your domains
- Swap in-memory adapters for production implementations
- Follow the port/adapter pattern
- Keep use cases focused and testable

## License

MIT
