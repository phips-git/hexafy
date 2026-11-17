# AWS Lambda Example App

Reference AWS Lambda application showing how to expose `@hexafy/core` use cases through `@hexafy/aws-lambda`.

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

## Runtime artifacts and usage

| Artifact                    | What it is for                        | Minimal usage                                    |
| --------------------------- | ------------------------------------- | ------------------------------------------------ |
| `src/lambda/say-hello.ts`   | Basic Lambda use case adapter example | Invoke with body containing `name`               |
| `src/lambda/create-user.ts` | Validation + persistence flow example | Invoke with user payload                         |
| `createLambdaHandler` usage | Standardized Lambda handler wiring    | Keep transformation/formatting in handler config |

## How it fits with `@hexafy/core`

- Business rules run in core-style use cases
- Lambda wiring and response adaptation live in `@hexafy/aws-lambda`
- Infrastructure adapters remain outside use case logic

## Recommended usage

- Use this app as a deployment-oriented integration reference
- Keep handlers thin and deterministic
- Promote shared logic into packages, not app entrypoints

## License

MIT
