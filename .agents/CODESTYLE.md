# Codestyle

## Principles

- **Self-explanatory code** - Clear names, no unnecessary comments
- **No `any` types** - Full type safety required
- **No type-assertion shortcuts** - Avoid `as any`, `as unknown as`, and casting to bypass compiler errors; prefer precise types, `unknown` with guards, and `satisfies`
- **Type-safe boundaries** - Validate untrusted runtime values at boundaries and narrow them with type guards before usage
- **Direct imports** - No convenience re-exports
- **Small functions** - Single responsibility

### Type-safety rules

- Prefer explicit interfaces, type aliases, and helper functions over `as` casts
- Use `unknown` for untrusted values and validate with `typeof`, `instanceof`, or custom guards before narrowing
- Use `satisfies` when you want to check a value against a type without widening it
- Only use a cast when the runtime contract is already known and the cast is expressing a true narrowing, not hiding a type problem
- If a cast is needed at a boundary (for example JSON parsing or framework payloads), put it behind a small validating function that proves the runtime shape

```ts
const user = readFromExternalSource();

if (!isUser(user)) {
  throw new ValidationError('Invalid user payload');
}

return user;
```

Bad patterns:

```ts
const user = payload as User; // bypasses validation
const value = data as any; // hides a real type problem
```

## Naming

- **Classes**: PascalCase (`SqliteDatabaseClient`)
- **Functions**: camelCase (`initializeSchema`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Types**: PascalCase (`TaskStatus`)

## Error Classes

All errors extend `ApplicationError` with `code` and optional `context`:

| Class                 | Code                   | Use                        |
| --------------------- | ---------------------- | -------------------------- |
| `ApplicationError`    | `APPLICATION_ERROR`    | Generic application errors |
| `ValidationError`     | `VALIDATION_ERROR`     | Input validation failures  |
| `NotFoundError`       | `NOT_FOUND_ERROR`      | Missing resources          |
| `ConflictError`       | `CONFLICT_ERROR`       | Duplicate entries          |
| `UnauthorizedError`   | `UNAUTHORIZED_ERROR`   | Auth failures              |
| `ForbiddenError`      | `FORBIDDEN_ERROR`      | Permission denied          |
| `InvariantError`      | `INVARIANT_ERROR`      | Business rule violations   |
| `InfrastructureError` | `INFRASTRUCTURE_ERROR` | External service failures  |

```typescript
throw new ValidationError('Email required');
throw new NotFoundError('User');
throw new ConflictError('Email already registered');
```

## NestJS Integration

```typescript
// Module setup
import { DomainModule, InfrastructureModule } from '@hexafy/nestjs';

@Module({
  imports: [
    DomainModule.forRoot(configService),
    InfrastructureModule.forRoot(configService)
  ]
})
export class AppModule {}

// Exception filters
import { DomainExceptionFilter, HttpExceptionFilter } from '@hexafy/nestjs';

@Controller()
export class UserController {
  @UseFilters(new DomainExceptionFilter())
  @Get()
  async getAll() {
    // ...
  }
}
```

Also see [PROJECT-STRUCTURE.md](./PROJECT-STRUCTURE.md) for package layout and import/export patterns.

### Use Cases

Extend `Usecase` base class:

```typescript
import { failure, success, Usecase } from '@hexafy/core/application';
import { ValidationError } from '@hexafy/core/domain';

class CreateUserUseCase extends Usecase<Input, Output> {
  protected async executeInternal(input: Input, logger: LoggingPort) {
    if (!input.email) {
      return failure(new ValidationError('Email required'));
    }

    logger.info('User created', { email: input.email });
    return success({ userId: '123' });
  }
}
```

### Errors

- **Domain errors**: Return via `failure(...)` from a use case; do not throw for expected business failures
- **Infrastructure errors**: Throw (`NotFoundError`, `ValidationError`, etc.) at the boundary when they are not part of the business result contract

### Exports

Prefer the package subpaths that match the responsibility:

```typescript
import { failure, success, unwrap, Usecase } from '@hexafy/core/application';
import {
  ApplicationError,
  Entity,
  type LoggerPort,
  ValidationError
} from '@hexafy/core/domain';
import {
  ConsoleLoggingAdapter,
  NoOpLoggingAdapter,
  NoOpMetricsAdapter
} from '@hexafy/core/infrastructure';
```
