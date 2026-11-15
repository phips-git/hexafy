# NestJS Example App

Reference NestJS application showing how to wire `@hexafy/core` and `@hexafy/nestjs` in a hexagonal architecture setup.

## Why this app exists

This app demonstrates HTTP controllers, use-case execution, repository adapters, and exception filters in one minimal integration example.

## Installation

```bash
bun install
```

## Quick start

```bash
bun run start:dev
```

## Runtime artifacts and usage

| Artifact                            | What it is for                       | Minimal usage                            |
| ----------------------------------- | ------------------------------------ | ---------------------------------------- |
| `POST /hello`                       | Simple use-case invocation example   | Send `{ "name": "World" }`               |
| `POST /users`                       | User creation flow with validation   | Send `{ "name": "...", "email": "..." }` |
| `DomainExceptionFilter` integration | Maps domain errors to HTTP responses | Register as global `APP_FILTER`          |

## How it fits with `@hexafy/core`

- Domain/application logic uses `@hexafy/core` use cases and errors
- Nest-specific wiring uses `@hexafy/nestjs`
- Controllers stay thin and delegate business logic to use cases

## Recommended usage

- Use this app as integration reference only
- Mirror the layering pattern in your own modules
- Replace in-memory adapters with production adapters in infrastructure layer

## License

MIT
