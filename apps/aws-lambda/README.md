# AWS Lambda Example App

Reference AWS Lambda application demonstrating hexagonal architecture with `@hexafy/core`, `@hexafy/aws-lambda`, and `@hexafy/example-domain`.

## Quick Start

```bash
bun install
bun run build
```

Build output is generated in `dist/` for deployment.

## Available Handlers

| Handler          | Description      | Input                     |
| ---------------- | ---------------- | ------------------------- |
| `say-hello`      | Simple greeting  | `{name: string}`          |
| `create-user`    | User creation    | `{name, email, password}` |
| `create-task`    | Task creation    | `{title, projectId}`      |
| `create-project` | Project creation | `{name, description}`     |

## Architecture

```
API Gateway ──▶ Lambda Handler ──▶ Use Case ──▶ Repository
```

Handlers transform API Gateway events into use case input, execute business logic from `@hexafy/example-domain`, and format responses.

## Project Structure

```
src/
└── lambda/                    # Lambda handlers
    ├── say-hello.ts          # Greeting use case
    ├── create-user.ts        # User with validation
    ├── create-task.ts        # Task management
    ├── create-project.ts     # Project management
    ├── delete-task.ts        # Task deletion
    ├── update-task.ts        # Task updates
    ├── delete-project.ts     # Project deletion
    ├── update-project.ts     # Project updates
    ├── list-tasks.ts         # List tasks
    └── shared/               # Shared utilities
        ├── auth.ts           # Authentication helpers
        ├── errors.ts         # API error types
        └── use-case-factory.ts  # Use case adapters
```

## Key Patterns

- **Thin handlers**: Handlers only transform data and delegate to use cases
- **Shared adapters**: `use-case-factory.ts` wraps `@hexafy/example-domain` use cases
- **Error handling**: Consistent error responses via `formatJsonResponse`
- **Authentication**: Helper functions in `shared/auth.ts`

## Usage Example

```bash
aws lambda invoke \
  --function-name hello \
  --cli-binary-format raw-in-base64-out \
  --payload '{"name": "World"}' \
  response.json

cat response.json
# { "message": "Hello, World! Welcome to hexagonal architecture." }
```

## Recommendations

- Keep handlers thin; move logic to shared utilities or packages
- Use `use-case-factory.ts` for wrapping example-domain use cases
- Replace in-memory adapters with production implementations
- Follow the handler pattern: transform → execute → format

## License

MIT
