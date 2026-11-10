# Codestyle

## Principles

- **Self-explanatory code** - Clear names, no unnecessary comments
- **No `any` types** - Full type safety required
- **Direct imports** - No convenience re-exports
- **Small functions** - Single responsibility

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

Also see [PROJECT-STRUCTURE.md](../PROJECT-STRUCTURE.md) for import/export patterns.

### Use Cases

Extend `Usecase` base class:

```typescript
import { failure, success, Usecase } from '@hexafy/core/application';

class CreateUserUseCase extends Usecase<Input, Output> {
  async executeInternal(input, logger) {
    if (!input.email) {
      return failure(new ValidationError('Email required'));
    }
    return success({ userId: '123' });
  }
}
```

### Errors

- **Domain errors**: Return via `Result` (don't throw)
- **Infrastructure errors**: Throw (`NotFoundError`, `ValidationError`, etc.)

### Exports

Import from subpaths:

```typescript
import { Usecase } from '@hexafy/core/application';
import { Usecase } from '@hexafy/core/domain';
import { LoggerPort } from '@hexafy/core/infrastructure';
```
