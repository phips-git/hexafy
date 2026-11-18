# NestJS Example App

Reference NestJS application demonstrating hexagonal architecture with `@hexafy/core`, `@hexafy/nestjs`, and `@hexafy/example-domain`.

## Quick Start

```bash
bun install
bun run start:dev
```

## API Endpoints

| Method | Endpoint              | Description           | Input                          |
| ------ | --------------------- | --------------------- | ------------------------------ |
| `POST` | `/hello`              | Greeting              | `{name: string}`               |
| `POST` | `/users`              | User creation         | `{name, email, password}`      |
| `POST` | `/projects`           | Project creation      | `{name, description}`          |
| `POST` | `/tasks`              | Task creation         | `{title, projectId, priority}` |
| `POST` | `/tasks/:id/complete` | Complete task         | -                              |
| `GET`  | `/tasks/project/:id`  | List tasks by project | -                              |

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Controllers  │────▶│  Use Cases   │────▶│ Repositories │
│   (HTTP)     │     │(Application) │     │(Infrastructure)│
└──────────────┘     └──────────────┘     └──────────────┘
```

Controllers delegate all business logic to use cases from `@hexafy/example-domain`.

## Project Structure

```
src/
├── app.module.ts          # Module wiring
├── main.ts                # Entry point
├── controllers/           # HTTP controllers
│   ├── hello.controller.ts     # Greeting endpoint
│   └── users.controller.ts     # User endpoint
├── projects/              # Project controller
│   └── projects.controller.ts
└── tasks/                 # Task controller
    └── tasks.controller.ts
```

## Key Patterns

- **Thin controllers**: Controllers delegate to use cases, contain no business logic
- **Shared use cases**: All use cases come from `@hexafy/example-domain`
- **Dependency injection**: NestJS providers wire use cases with repositories
- **In-memory adapters**: Ready for production swap (PostgreSQL, MongoDB, etc.)

## Usage Example

```bash
# Create a user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@example.com", "password": "secret"}'

# Create a project
curl -X POST http://localhost:3000/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "My Project", "description": "Demo"}'
```

## Recommendations

- Mirror the layering: controller → use case → repository
- Use example-domain use cases directly; don't duplicate
- Replace in-memory adapters with production implementations
- Keep controllers thin; move validation/transformation to use cases

## License

MIT
