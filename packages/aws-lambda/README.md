# @hexafy/aws-lambda

AWS Lambda adapters for hexagonal architecture. Connect `@hexafy/core` use cases with API Gateway events.

## Installation

```bash
bun add @hexafy/aws-lambda
```

## createLambdaHandler

Primary entry point - create Lambda handlers from use cases:

```typescript
import {
  createLambdaHandler,
  formatJsonResponse,
  parseJsonBody
} from '@hexafy/aws-lambda';
import { UseCase } from '@hexafy/core/application';

class SayHelloUseCase extends UseCase<{ name: string }, { message: string }> {
  protected async executeInternal(input: { name: string }) {
    return { message: `Hello, ${input.name}!` };
  }
}

export const handler = createLambdaHandler({
  useCase: new SayHelloUseCase(),
  inputTransformer: parseJsonBody,
  responseFormatter: formatJsonResponse
});
```

## Input Parsing

```typescript
import {
  parseJsonBody,
  parsePathParameters,
  parseQueryParameters,
  validateHttpMethod,
  validateRequiredHeaders
} from '@hexafy/aws-lambda';

const body = parseJsonBody<{ name: string }>(event);
const query = parseQueryParameters<{ page: string }>(event);
const id = parsePathParameters<{ id: string }>(event).id;
```

## Response Formatting

```typescript
import {
  formatBadRequest,
  formatError,
  formatForbidden,
  formatJsonResponse,
  formatNotFound,
  formatUnauthorized
} from '@hexafy/aws-lambda';
```

## Complete Example

```typescript
import {
  createLambdaHandler,
  formatError,
  formatJsonResponse,
  parseJsonBody
} from '@hexafy/aws-lambda';
import { UseCase } from '@hexafy/core/application';
import { ValidationError } from '@hexafy/core/domain';

class CreateUserUseCase extends UseCase<
  { email: string; password: string },
  { userId: string; token: string }
> {
  protected async executeInternal(input) {
    if (!input.email) {
      throw new ValidationError('Email required');
    }
    return { userId: '123', token: 'abc' };
  }
}

export const handler = createLambdaHandler({
  useCase: new CreateUserUseCase(),
  inputTransformer: parseJsonBody,
  responseFormatter: formatJsonResponse,
  errorFormatter: formatError
});
```

## License

MIT
