# AWS Lambda Example App

Reference AWS Lambda application showing how to expose `@hexafy/core` use cases through `@hexafy/aws-lambda` and integrate with `@hexafy/example-domain`.

## Why this app exists

This app demonstrates event to use case transformation, response formatting, and boundary error handling for Lambda/API Gateway workloads.

## Installation

```bash
bun install
```

## Quick start

```bash
bun run build
```

Build output is generated in `dist/` and can be deployed with your preferred IaC tool.

## API Endpoints

| Method | Handler       | Description                   | Request Body                                         |
| ------ | ------------- | ----------------------------- | ---------------------------------------------------- |
| `POST` | `say-hello`   | Simple greeting use case      | `{"name": "World"}`                                  |
| `POST` | `create-user` | User creation with validation | `{"name": "...", "email": "...", "password": "..."}` |

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Lambda        │────▶│  Use Cases       │────▶│  Repositories   │
│   Handler       │     │  (Application)   │     │ (Infrastructure)│
│                 │     │                  │     │                 │
│ @hexafy/aws-    │     │ @hexafy/example- │     │ In-memory       │
│ lambda          │     │ domain           │     │ adapters        │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Runtime artifacts and usage

| Artifact                    | What it is for                        | Minimal usage                                    |
| --------------------------- | ------------------------------------- | ------------------------------------------------ |
| `src/lambda/say-hello.ts`   | Basic Lambda use case adapter example | Invoke with body containing `name`               |
| `src/lambda/create-user.ts` | Validation + persistence flow example | Invoke with user payload                         |
| `createLambdaHandler` usage | Standardized Lambda handler wiring    | Keep transformation/formatting in handler config |

## How it fits with `@hexafy/core`

- **Business rules**: Run in core-style use cases extending `@hexafy/core/application/Usecase`
- **Lambda wiring**: `@hexafy/aws-lambda` handles event transformation and response adaptation
- **Example domain**: Integrates `@hexafy/example-domain` for auth flows
- **Infrastructure adapters**: In-memory repositories in `/infrastructure` ready for production swap

## Example Usage

### Say Hello

```bash
aws lambda invoke \
  --function-name hello-function \
  --cli-binary-format raw-in-base64-out \
  --payload '{"name": "World"}' \
  response.json

cat response.json
# { "message": "Hello, World! Welcome to hexagonal architecture." }
```

### Create User

```bash
aws lambda invoke \
  --function-name create-user-function \
  --cli-binary-format raw-in-base64-out \
  --payload '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }' \
  response.json

cat response.json
# { "success": true, "data": { "id": "user_123", "email": "john@example.com", "name": "John Doe" } }
```

## Recommended usage

- Use this app as a deployment-oriented integration reference
- Keep handlers thin and deterministic
- Promote shared logic into packages, not app entrypoints
- Replace in-memory adapters with production implementations for your persistence layer

## Project structure

```
src/
├── lambda/                 # Lambda function handlers
│   ├── say-hello.ts       # Simple greeting handler
│   ├── create-user.ts     # User creation handler
│   └── shared/            # Shared utilities
│       ├── auth.ts        # Authentication helpers
│       ├── errors.ts      # Error types
│       └── use-case-factory.ts  # Use case factory
└── application/           # Application layer use cases
    └── use-cases/
        └── create-user.use-case.ts
```

## License

MIT
