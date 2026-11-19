# @hexafy/core

Core hexagonal architecture primitives for TypeScript: use cases, domain building blocks, and infrastructure ports/adapters.

## Why this package exists

`@hexafy/core` is the foundation of the Hexafy package family. It keeps business logic framework-agnostic and provides:

- Application orchestration (`UseCase`, `ServiceBase`)
- Use-case outcome contract (`UseCaseResult`)
- Domain errors and primitives (`ApplicationError`, `Entity`, `AggregateRoot`, `ValueObject`, `RepositoryBase`, `Brand`, `ErrorCodes`)
- Domain error helpers (`isDomainError`, `getDomainErrorCode`)
- Transaction boundaries (`UnitOfWorkBase`)
- Cross-cutting ports and default adapters (logging, metrics, clock, identifier)

## Installation

```bash
npm install @hexafy/core
```

## Core Concepts

### UseCase - Lifecycle & Execution

Use cases define single-responsibility business operations with built-in lifecycle management, timeouts, and cancellation.

```ts
import {
  type LoggingPort,
  UseCase,
  type UseCaseConfiguration
} from '@hexafy/core/application';
import {
  RepositoryBase,
  type RepositoryPort,
  type UniqueIdentifier,
  ValidationError
} from '@hexafy/core/domain';
import { ConsoleLoggingAdapter } from '@hexafy/core/infrastructure';

interface User {
  id: UniqueIdentifier;
  email: string;
  name: string;
}

interface CreateUserInput {
  email: string;
  name: string;
}

interface CreateUserOutput {
  id: UniqueIdentifier;
}

class UserRepository extends RepositoryBase<User, UniqueIdentifier> {
  // Override methods (save, findById, etc.) only if you need custom logic
}

class CreateUserUseCase extends UseCase<CreateUserInput, CreateUserOutput> {
  constructor(
    private readonly userRepository: RepositoryPort<User, UniqueIdentifier>,
    config?: UseCaseConfiguration
  ) {
    super(config);
  }

  // Implement business logic here
  protected async executeInternal(
    input: CreateUserInput,
    logger: LoggingPort
  ): Promise<CreateUserOutput> {
    if (!input.email.includes('@')) {
      throw new ValidationError('Invalid email');
    }

    const user = {
      id: crypto.randomUUID() as UniqueIdentifier,
      email: input.email,
      name: input.name
    } satisfies User;

    await this.userRepository.save(user);
    logger.info('User created', { email: input.email });

    return { id: user.id };
  }
}

// Wire everything together at the boundary
const userRepository = new UserRepository();
const useCase = new CreateUserUseCase(userRepository, {
  // Logging is provided by base class and injected into executeInternal
  logging: ConsoleLoggingAdapter,
  // Safety net: 5 second timeout with automatic cancellation
  timeoutMs: 5000
});

const result = await useCase.execute({
  email: 'user@example.com',
  name: 'John'
});

if (result.success) {
  console.log('Created:', result.value);
}
// else handle error
```

### Cancellation & Timeouts

Cancellation via `AbortSignal` and automatic timeouts:

```ts
// Cancellation
const controller = new AbortController();
const result = await useCase.execute(input, { signal: controller.signal });
controller.abort();

// Timeout in constructor
const useCase = new MyUseCase({ timeoutMs: 10000 });
```

### ServiceBase

For reusable services without full use case lifecycle. Services can be injected into use cases.

```ts
import {
  type ClockPort,
  type MetricsPort,
  ServiceBase
} from '@hexafy/core/application';

interface Product {
  id: string;
  name: string;
  price: number;
}

class PricingService extends ServiceBase {
  constructor(
    clock: ClockPort,
    metrics: MetricsPort,
    config?: { logging?: any; clock?: ClockPort; metrics?: MetricsPort }
  ) {
    super(config);
  }

  // Calculate total price for products
  async calculateTotal(items: Product[]): Promise<number> {
    const startTime = this.clock.now();

    const total = items.reduce((sum, p) => sum + p.price, 0);

    this.metrics.increment('orders_calculated_total');
    this.metrics.histogram(
      'calculation_duration',
      this.clock.now() - startTime
    );

    return total;
  }
}

// Use the service in a use case
class CheckoutUseCase {
  constructor(
    private readonly pricingService: PricingService,
    private readonly paymentPort: PaymentPort
  ) {}

  async execute(items: Product[], userId: string): Promise<OrderId> {
    const total = await this.pricingService.calculateTotal(items);

    const orderId = await this.paymentPort.charge(userId, total);
    return orderId;
  }
}
```

### Ports & Adapters

Define ports for external concerns and implement them in infrastructure:

```ts
// Define your port interface
interface NotificationPort {
  sendEmail(recipient: string, subject: string, body: string): Promise<void>;
  sendSms(phone: string, message: string): Promise<void>;
}

// Implement in your infrastructure layer
class SendGridNotificationAdapter implements NotificationPort {
  async sendEmail(recipient: string, subject: string, body: string) {
    await sendGrid.send({ to: recipient, subject, body });
  }

  async sendSms(phone: string, message: string) {
    await twilio.send({ to: phone, message });
  }
}

// Inject the port into your use case
class UserRegistrationUseCase extends UseCase<RegisterInput, UserId> {
  constructor(
    private readonly notificationPort: NotificationPort, // <-- Injected
    config?: UseCaseConfiguration
  ) {
    super(config);
  }

  protected async executeInternal(input: RegisterInput): Promise<UserId> {
    const userId = await this.userRepository.save(/* ... */);

    // Use the port in your business logic
    await this.notificationPort.sendEmail(
      input.email,
      'Welcome!',
      'Thanks for signing up!'
    );

    return userId;
  }
}

// Wire at the application boundary
const notificationAdapter = new SendGridNotificationAdapter();
const useCase = new UserRegistrationUseCase(notificationAdapter);
```

### Domain Errors

Typed error classes for expected failures:

```ts
import {
  ConflictError,
  NotFoundError,
  ValidationError
} from '@hexafy/core/domain';

throw new ValidationError('Invalid input', { context: { field: 'email' } });
throw new NotFoundError('User', { cause: dbError });
```

## Error Handling

`execute()` returns `UseCaseResult<TSuccess, TFailure>` - never throws exceptions:

```ts
import {
  UseCaseCancelledError,
  UseCaseTimeoutError
} from '@hexafy/core/application';

const result = await useCase.execute(input, { signal });

if (!result.success) {
  if (result.error instanceof UseCaseTimeoutError) {
    // Operation exceeded timeoutMs
  } else if (result.error instanceof UseCaseCancelledError) {
    // Request was cancelled
  } else {
    // Domain/application error from executeInternal (ValidationError, NotFoundError, etc.)
  }
}
```

### Error Classes

Typed error classes for expected failures:

```ts
import {
  ConflictError,
  NotFoundError,
  ValidationError
} from '@hexafy/core/domain';

throw new ValidationError('Invalid input', { context: { field: 'email' } });
throw new NotFoundError('User', { cause: dbError });
```

### Error Flow

1. **In `executeInternal`**: Throw typed domain errors (`ValidationError`, `NotFoundError`, etc.)
2. **Wrapped automatically**: Errors flow through `result.error` intact
3. **At boundaries**: Map error codes to HTTP status, format responses

### Custom Error Hierarchies

Extend `ApplicationError` for your business domain:

```ts
import { ApplicationError, ErrorCodes } from '@hexafy/core/domain';

export class InsufficientBalanceError extends ApplicationError {
  constructor(
    message = 'Insufficient balance',
    options?: { balance: number; required: number }
  ) {
    super(message, {
      ...options,
      code: options?.code ?? ErrorCodes.CONFLICT_ERROR
    });
  }
}

// Usage
const balance = await accountRepository.getBalance(accountId);
if (balance < required) {
  throw new InsufficientBalanceError('Insufficient funds', {
    balance,
    required
  });
}
```

### HTTP Mapping

Map error codes to HTTP status at your adapter:

```ts
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

function mapErrorToStatus(error: Error): number {
  switch (error.code) {
    case ErrorCodes.VALIDATION_ERROR:
      return 400;
    case ErrorCodes.UNAUTHORIZED_ERROR:
      return 401;
    case ErrorCodes.FORBIDDEN_ERROR:
      return 403;
    case ErrorCodes.NOT_FOUND_ERROR:
      return 404;
    case ErrorCodes.CONFLICT_ERROR:
      return 409;
    case ErrorCodes.INFRASTRUCTURE_ERROR:
      return 500;
    default:
      return 500;
  }
}

// NestJS exception filter
@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const statusCode = mapErrorToStatus(exception as Error);
    const error = exception as Error & { code?: string };

    response.status(statusCode).json({
      success: false,
      error: error.message,
      code: error.code
    });
  }
}
```

## Public API

Three subpath entry points:

- `@hexafy/core/application` – UseCase, ServiceBase, ports, configuration
- `@hexafy/core/domain` – Domain primitives, errors, repository ports
- `@hexafy/core/infrastructure` – Default adapters (logging, clock, metrics, identifier)

## Export Reference

| Export                                                                     | Entry Point       | When to Use                                     |
| -------------------------------------------------------------------------- | ----------------- | ----------------------------------------------- |
| `UseCase`, `UseCaseConfiguration`                                          | `/application`    | Business operations with result contract        |
| `ServiceBase`, `ServiceConfiguration`                                      | `/application`    | Reusable services                               |
| `UseCaseResult`, `UseCaseExecutionOptions`                                 | `/application`    | Handling outcomes, passing context/signal       |
| `UseCaseCancelledError`, `UseCaseTimeoutError`                             | `/application`    | Handling execution boundary failures            |
| `ClockPort`, `IdentifierPort`, `LoggingPort`, `MetricsPort`                | `/application`    | Dependency inversion for cross-cutting concerns |
| `ApplicationError`, `ErrorCodes`                                           | `/domain`         | Error handling, custom error hierarchies        |
| Domain errors (`ValidationError`, `NotFoundError`, etc.)                   | `/domain`         | Expected business failures                      |
| `isDomainError`, `getDomainErrorCode`                                      | `/domain`         | Type guards and error metadata extraction       |
| `Entity`, `AggregateRoot`, `ValueObject`, `UniqueIdentifier`, `Brand`      | `/domain`         | Rich domain models                              |
| `ApplicationErrorOptions`                                                  | `/domain`         | Error configuration typing                      |
| `RepositoryBase`, `RepositoryPort`                                         | `/domain`         | Persistence abstractions                        |
| `UnitOfWorkBase`                                                           | `/domain`         | Transaction boundaries                          |
| `SystemClockAdapter`, `SystemIdentifierAdapter`                            | `/infrastructure` | Production defaults                             |
| `ConsoleLoggingAdapter`, `JSONConsoleLoggingAdapter`, `NoOpLoggingAdapter` | `/infrastructure` | Built-in logging implementations                |
| `NoOpMetricsAdapter`                                                       | `/infrastructure` | Disable metrics while keeping port contract     |

## License

MIT
