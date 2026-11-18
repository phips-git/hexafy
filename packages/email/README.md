# @hexafy/email

Email domain and infrastructure for Hexafy applications, with Noop implementations.

## Why this package exists

This package defines email domain contracts (`Email`) and provides ports and adapters so application/domain code depends on contracts, not provider details.

It provides:

- domain model for email content
- application ports for send operations and content generation
- infrastructure adapters for testing (Noop)

## Installation

```bash
npm install @hexafy/core @hexafy/email
# or
bun add @hexafy/core @hexafy/email
# or
yarn add @hexafy/core @hexafy/email
```

`@hexafy/core` is recommended for cross-cutting concerns (logging, metrics, etc.).

Use subpath imports only:

- `@hexafy/email/domain`
- `@hexafy/email/application`
- `@hexafy/email/infrastructure`

## Quick start

```ts
import type { EmailContentPort, EmailPort } from '@hexafy/email/application';
import type { Email } from '@hexafy/email/domain';
import { EmailNoopAdapter } from '@hexafy/email/infrastructure';

const emailPort: EmailPort = new EmailNoopAdapter();

// Generate email content
const emailContent = await emailContentPort.generatePasswordReset(
  'user@example.com',
  'https://example.com/reset?token=abc123'
);

// Send email
await emailPort.send(emailContent);
```

## Public API at a glance

```ts
import type { EmailContentPort, EmailPort } from '@hexafy/email/application';
import type { Email } from '@hexafy/email/domain';
import { EmailNoopAdapter } from '@hexafy/email/infrastructure';
```

## Exported artifacts and usage

| Export             | Entry point          | What it is for                    | When to use                                        | Minimal usage                                     |
| ------------------ | -------------------- | --------------------------------- | -------------------------------------------------- | ------------------------------------------------- |
| `Email`            | `/domain`            | Email content model               | Typing email payloads and domain contracts         | Use as type for email objects                     |
| `EmailPort`        | `/application/ports` | Email send operation contract     | Application code that sends emails                 | Depend on interface and inject adapter            |
| `EmailContentPort` | `/application/ports` | Email content generation contract | Generating templated emails (password reset, etc.) | Depend on interface, implement content generation |
| `EmailNoopAdapter` | `/infrastructure`    | In-memory no-op email adapter     | Tests and local prototypes without external email  | `new EmailNoopAdapter()`                          |

## How it fits with `@hexafy/core`

- Keep `EmailPort` and `EmailContentPort` dependencies in application layer
- Keep provider-specific logic (SendGrid, SMTP, etc.) inside infrastructure adapters
- Use logging ports from `@hexafy/core` for email send operations
- Use this package as a companion domain boundary, not as a core-domain replacement

## Recommended usage

1. **Inject `EmailPort`** into use cases that need to send emails
2. **Implement `EmailContentPort`** with your template engine or provider
3. **Use `EmailNoopAdapter`** in tests to avoid sending real emails
4. **Keep email templates** externalized and tenant-scoped at app boundaries

## Package structure

```
src/
├── domain/
│   └── models/
│       └── email.model.ts      # Email content model
├── application/
│   └── ports/
│       ├── email.port.ts       # Email send contract
│       └── email-content.port.ts # Email content generation contract
└── infrastructure/
    └── adapters/
        └── email.noop.adapter.ts # No-op implementation for testing
```

## License

MIT
