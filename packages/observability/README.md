# @hexafy/observability

Hexafy observability companions for `@hexafy/core`, focused on correlation-aware logging and isolated execution observation.

If you're new to this package family, start with `@hexafy/core` first, then add this package for execution-level logging policy.

## Why this package exists

`@hexafy/core` provides the architectural primitives and execution lifecycle.  
`@hexafy/observability` adds opt-in observability policy adapters on top of those primitives, without redefining contracts.

It gives you:

- correlation IDs on log events
- buffered execution event aggregation with one summary emission
- domain-error-aware severity mapping
- isolated execution observation for detached/background/fan-out units

## Installation

```bash
npm install @hexafy/observability @hexafy/core
# or
bun add @hexafy/observability @hexafy/core
# or
yarn add @hexafy/observability @hexafy/core
```

`@hexafy/core` is a required peer dependency.

Use explicit subpaths only:

- `@hexafy/observability/application`
- `@hexafy/observability/infrastructure`

## Quick start

```ts
import {
  type LoggingPort,
  Usecase,
  type UsecaseConfiguration
} from '@hexafy/core/application';
import { ConsoleLoggingAdapter } from '@hexafy/core/infrastructure';
import { CorrelationLoggerAdapter } from '@hexafy/observability/infrastructure';

class CreateUserUseCase extends Usecase<{ name: string }, { id: string }> {
  constructor(config?: UsecaseConfiguration) {
    super(config);
  }

  protected async executeInternal(
    input: { name: string },
    logger: LoggingPort
  ) {
    logger.info('Creating user', { name: input.name });
    return { id: 'u_123' };
  }
}

const usecase = new CreateUserUseCase({
  logging: new CorrelationLoggerAdapter(ConsoleLoggingAdapter, {
    correlationIdFactory: () => crypto.randomUUID()
  })
});
```

## Public API at a glance

```ts
import {
  type IsolatedExecutionObserver,
  IsolatedExecutionObserverAdapter,
  type IsolatedExecutionObserverAdapterOptions
} from '@hexafy/observability/application';
import {
  AggregatingLoggerAdapter,
  type AggregatingLoggerAdapterOptions,
  CorrelationLoggerAdapter,
  type CorrelationLoggerAdapterOptions,
  DomainErrorLevelLoggerAdapter,
  type ExecutionLogEntry,
  type ExecutionLogLevel,
  type LogLevel,
  type LogLevelAwareError,
  resolveLogLevelFromError
} from '@hexafy/observability/infrastructure';
```

## Exported artifacts and usage

| Export                                    | Entry point       | What it is for                                               | When to use                                                      | Minimal usage                                                   |
| ----------------------------------------- | ----------------- | ------------------------------------------------------------ | ---------------------------------------------------------------- | --------------------------------------------------------------- |
| `IsolatedExecutionObserverAdapter`        | `/application`    | Runs one task in its own observability envelope              | Detached background jobs, fan-out items, workflow steps          | `observe(name, async (logger) => ..., context)`                 |
| `IsolatedExecutionObserver`               | `/application`    | Contract for isolated execution observation                  | Dependency inversion around execution observation                | Depend on interface, inject adapter                             |
| `IsolatedExecutionObserverAdapterOptions` | `/application`    | Configuration for observer adapter dependencies and policies | Custom logger factories, clock, id generator, log-level resolver | Pass options to `new IsolatedExecutionObserverAdapter(options)` |
| `AggregatingLoggerAdapter`                | `/infrastructure` | Buffers log events and emits one summary with `flush()`      | Step-based operations where you want one final summary event     | Log via adapter, then call `flush(context)`                     |
| `AggregatingLoggerAdapterOptions`         | `/infrastructure` | Aggregation behavior configuration                           | You need a custom summary message                                | Pass `{ flushMessage }` at construction                         |
| `ExecutionLogEntry`                       | `/infrastructure` | Typed shape of one buffered execution event                  | Working with aggregated events programmatically                  | Use as type for event arrays and adapters                       |
| `ExecutionLogLevel`                       | `/infrastructure` | Allowed log levels for execution event entries               | Typing custom event transformations                              | Use as type union for level-safe handling                       |
| `CorrelationLoggerAdapter`                | `/infrastructure` | Adds `correlationId` to each log payload                     | Request-scoped and execution-scoped correlation                  | Wrap your base logger and pass `correlationIdFactory`           |
| `CorrelationLoggerAdapterOptions`         | `/infrastructure` | Correlation ID generation configuration                      | Correlation IDs come from request/job context                    | Pass `{ correlationIdFactory }` at construction                 |
| `DomainErrorLevelLoggerAdapter`           | `/infrastructure` | Logger adapter that maps errors to semantic severity         | You need a consistent domain-error severity policy               | Wrap logger and call adapter logging methods                    |
| `resolveLogLevelFromError`                | `/infrastructure` | Standalone unknown-error to `info/warn/error` resolver       | Custom adapters or observer pipelines                            | Call in `catch` and switch on returned level                    |
| `LogLevel`                                | `/infrastructure` | Union type for supported severity levels                     | Type-safe log-level plumbing in custom code                      | Use as function return/parameter type                           |
| `LogLevelAwareError`                      | `/infrastructure` | Error contract with optional preferred log level             | Custom error classes carrying severity hints                     | Implement/extend and provide level metadata                     |

## How it fits with `@hexafy/core`

Use the same layering model as `@hexafy/core`:

- Keep domain/application primitives in `@hexafy/core`
- Keep observability policy adapters in `@hexafy/observability`
- Prefer injected `LoggingPort` as the default inside `Usecase.executeInternal`
- Use isolated execution observation only when you need a separate execution envelope

### Default path: injected `LoggingPort` in use cases/services

```ts
import { Usecase } from '@hexafy/core/application';
import { ConsoleLoggingAdapter } from '@hexafy/core/infrastructure';
import { CorrelationLoggerAdapter } from '@hexafy/observability/infrastructure';

const logging = new CorrelationLoggerAdapter(ConsoleLoggingAdapter, {
  correlationIdFactory: () => crypto.randomUUID()
});

class CreateUserUseCase extends Usecase<{ name: string }, { id: string }> {
  protected async executeInternal(input, logger) {
    logger.info('Creating user', { name: input.name });
    return { id: 'u_123' };
  }
}

const usecase = new CreateUserUseCase({ logging });
```

### Isolated path: separate execution envelope for detached units

Use this when work should have its own execution envelope:

- background/fire-and-forget tasks
- fan-out batch units (many parallel items)
- workflow/job steps that outlive the parent request

Avoid wrapping normal `Usecase.executeInternal` flow with this if plain injected logging is sufficient.

```ts
import {
  ConsoleLoggingAdapter,
  SystemIdentifierAdapter
} from '@hexafy/core/infrastructure';
import { IsolatedExecutionObserverAdapter } from '@hexafy/observability/application';

const observer = new IsolatedExecutionObserverAdapter({
  loggerFactory: () => ConsoleLoggingAdapter,
  executionIdGenerator: SystemIdentifierAdapter
});

await observer.observe(
  'SyncUsers',
  async (log) => {
    log.info('Fetching page', { page: 1 });
    log.info('Persisting users', { count: 50 });
    return { imported: 50 };
  },
  { source: 'crm' }
);
```

## Recommended usage

- Keep this package as a companion to `@hexafy/core`, not a standalone foundation
- Use one observability pattern per execution path unless you intentionally need parent/child traces
- Keep correlation IDs deterministic at boundaries when possible (request ID, job ID)
- Keep aggregation summaries concise and structured for machine processing

## License

MIT
