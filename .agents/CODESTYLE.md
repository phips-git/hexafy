# Codestyle

These conventions are mandatory for all code changes by agents and contributors.

## Principles

- **Self-explanatory code** - Clear names, no unnecessary comments
- **Drift-resistant docs** - Prefer linking to canonical examples over duplicating code; document patterns not implementations
- **No `any` types** - Full type safety required
- **No type-assertion shortcuts** - Avoid `as any`, `as unknown as`, and casting to bypass compiler errors; prefer precise types, `unknown` with guards, and `satisfies`
- **Type-safe boundaries** - Validate untrusted runtime values at boundaries and narrow them with type guards before usage
- **Direct imports** - No convenience re-exports
- **Small functions** - Single responsibility
- **No alias clutter** - Do not keep deprecated compatibility aliases after renames unless migration support is explicitly required
- **Public-first ordering** - File ordering: imports → types/interfaces → public exports → private/const helpers

### Type-safety rules

- Prefer explicit interfaces, type aliases, and helper functions over `as` casts
- Use `unknown` for untrusted values and validate with `typeof`, `instanceof`, or custom guards before narrowing
- Use `satisfies` when you want to check a value against a type without widening it
- Only use a cast when the runtime contract is already known and the cast is expressing a true narrowing, not hiding a type problem
- If a cast is needed at a boundary (for example JSON parsing or framework payloads), put it behind a small validating function that proves the runtime shape

## Naming

- **Classes**: PascalCase (`SqliteDatabaseClient`)
- **Functions**: camelCase (`initializeSchema`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Types**: PascalCase (`TaskStatus`)

## Canonical examples (drift-resistant)

Prefer linking to these files over copying snippets into agent docs:

- `packages/core/README.md` - current public usage examples
- `packages/core/src/domain/errors/application.error.ts` - canonical error classes and codes
- `packages/core/src/application/use-case.ts` - canonical `UseCase` contract
- `packages/core/src/application/service.base.ts` - canonical `ServiceBase` contract

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
