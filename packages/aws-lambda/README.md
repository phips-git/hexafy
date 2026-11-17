# @hexafy/aws-lambda

AWS Lambda adapter utilities for running `@hexafy/core` use cases behind API Gateway handlers.

## Why this package exists

`@hexafy/core` defines use case execution and domain contracts.  
`@hexafy/aws-lambda` maps Lambda/API Gateway input-output to those contracts so handlers stay thin and consistent.

It provides:

- `createLambdaHandler` to execute a use case from a Lambda handler
- default JSON/error formatter helpers
- API Gateway response formatter helpers for common status codes

## Installation

```bash
npm install @hexafy/aws-lambda @hexafy/core
# or
bun add @hexafy/aws-lambda @hexafy/core
# or
yarn add @hexafy/aws-lambda @hexafy/core
```

## Quick start

```ts
import { createLambdaHandler, formatJsonResponse } from '@hexafy/aws-lambda';

export const handler = createLambdaHandler({
  useCase: new CreateUserUseCase(),
  inputTransformer: (event) => {
    const body = event.body ? JSON.parse(event.body) : {};
    return { name: body.name, email: body.email };
  },
  responseFormatter: formatJsonResponse
});
```

## Public API at a glance

```ts
import {
  type APIGatewayErrorResponse,
  type APIGatewayEvent,
  type APIGatewayResponse,
  createLambdaHandler,
  formatBadRequest,
  formatError,
  formatForbidden,
  formatJsonResponse,
  formatNotFound,
  formatResponseError,
  formatSuccess,
  formatUnauthorized,
  type HandlerConfig
} from '@hexafy/aws-lambda';
```

## Exported artifacts and usage

| Export                                                             | Entry point | What it is for                                        | When to use                                              | Minimal usage                                        |
| ------------------------------------------------------------------ | ----------- | ----------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------- |
| `createLambdaHandler`                                              | `.`         | Creates Lambda handlers from `Usecase` instances      | API Gateway + use case orchestration                     | `createLambdaHandler({ useCase, inputTransformer })` |
| `HandlerConfig`                                                    | `.`         | Configuration type for handler factory                | Strongly typed handler configuration                     | Type config objects or generics                      |
| `APIGatewayEvent`, `APIGatewayResponse`, `APIGatewayErrorResponse` | `.`         | Event/response contracts used by the handler factory  | Explicit event-output typing                             | Use as function parameter/return types               |
| `formatJsonResponse`                                               | `.`         | Default success response formatter for handler output | Standard JSON success payloads                           | `responseFormatter: formatJsonResponse`              |
| `formatError`                                                      | `.`         | Default error formatter for handler failures          | Basic 4xx/5xx handler error mapping                      | `errorFormatter: formatError`                        |
| `formatSuccess`                                                    | `.`         | Generic success response helper                       | Custom handlers/adapters needing explicit success status | `formatSuccess(data, 201)`                           |
| `formatBadRequest`                                                 | `.`         | 400 JSON response helper                              | Input validation failures at boundary                    | `return formatBadRequest('Invalid input')`           |
| `formatUnauthorized`                                               | `.`         | 401 JSON response helper                              | Authentication failures                                  | `return formatUnauthorized()`                        |
| `formatForbidden`                                                  | `.`         | 403 JSON response helper                              | Authorization failures                                   | `return formatForbidden()`                           |
| `formatNotFound`                                                   | `.`         | 404 JSON response helper                              | Missing resources at boundary                            | `return formatNotFound('User')`                      |
| `formatResponseError`                                              | `.`         | Generic JSON error response helper alias              | Explicit status-controlled error formatting              | `formatResponseError(error, 422)`                    |

## How it fits with `@hexafy/core`

- Keep business logic and domain errors in `@hexafy/core` use cases
- Use this package only at the Lambda boundary for event/response adaptation
- Keep handler code focused on transformation/formatting, not domain logic

## Recommended usage

- Prefer one use case per handler entrypoint
- Keep `inputTransformer` deterministic and side-effect free
- Reuse formatter helpers for a uniform API response contract

## License

MIT
