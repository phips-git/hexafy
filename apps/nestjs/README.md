# NestJS Example App

Reference NestJS application showing how to wire `@hexafy/core` and `@hexafy/example-domain` in a hexagonal architecture setup.

## Why this app exists

This app demonstrates HTTP controllers, use case execution, repository adapters, and proper layering in one minimal integration example.

## Installation

```bash
bun install
```

## Quick start

```bash
bun run start:dev
```

## API Endpoints

| Method | Endpoint                    | Description                   | Request Body                                                 |
| ------ | --------------------------- | ----------------------------- | ------------------------------------------------------------ |
| `POST` | `/hello`                    | Simple greeting use case      | `{"name": "World"}`                                          |
| `POST` | `/users`                    | User creation with validation | `{"name": "...", "email": "...", "password": "..."}`         |
| `POST` | `/projects`                 | Create a new project          | `{"name": "...", "description": "..."}`                      |
| `POST` | `/tasks`                    | Create a new task             | `{"title": "...", "projectId": "...", "priority": "medium"}` |
| `POST` | `/tasks/:taskId/complete`   | Mark a task as completed      | -                                                            |
| `GET`  | `/tasks/project/:projectId` | List all tasks for a project  | -                                                            |

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Controllers   │────▶│   Use Cases      │────▶│  Repositories   │
│  (HTTP layer)   │     │  (Application)   │     │ (Infrastructure)│
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                       │                       │
        │                       ▼                       │
        │              ┌──────────────────┐            │
        └─────────────▶│ @hexafy/core     │◀───────────┘
                       │   (UseCase base) │
                       └──────────────────┘
```

## Layer Details

### Controllers

- Handle HTTP requests and responses
- Validate incoming data via DTOs
- Delegate business logic to use cases
- Located in `src/controllers/`, `src/projects/`, `src/tasks/`

### Use Cases

- Contain business logic
- Extend `@hexafy/core/application/Usecase` for built-in features (timeout, cancellation, metrics)
- Wrap `@hexafy/example-domain` use cases for demonstration
- Located in `src/domain/use-cases/`

### Infrastructure

- In-memory repositories implementing domain ports
- Demonstrates port/adapter pattern
- Ready to swap for production implementations (PostgreSQL, MongoDB, etc.)

## How it fits with `@hexafy/core`

- **Domain/Application logic**: Uses `@hexafy/core` use cases and errors (`Usecase`, `ValidationError`, `NotFoundError`)
- **Example domain**: Integrates `@hexafy/example-domain` for auth and task management
- **NestJS wiring**: Uses `@hexafy/nestjs` for integration patterns
- **Controllers stay thin**: All business logic is delegated to use cases

## Example Usage

### Create a user

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "password": "password123"}'
```

### Create a project

```bash
curl -X POST http://localhost:3000/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "My Project", "description": "A demo project"}'
```

### Create a task

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Complete task", "projectId": "project_123", "priority": "high"}'
```

### Complete a task

```bash
curl -X POST http://localhost:3000/tasks/task_123/complete
```

### List tasks for a project

```bash
curl http://localhost:3000/tasks/project/project_123
```

## Recommended usage

- Use this app as integration reference only
- Mirror the layering pattern in your own modules
- Replace in-memory adapters with production adapters in infrastructure layer
- Follow the pattern: domain ports → infrastructure adapters → application use cases → controllers

## License

MIT
