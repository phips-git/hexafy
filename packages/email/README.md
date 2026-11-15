# @hexafy/email

Email domain and infrastructure for Hexafy applications, with Noop implementations.

## Why this package exists

This package defines email domain contracts (`Email`, `EmailPort`, `EmailContentPort`) and provides adapter implementations so application/domain code depends on contracts, not provider details.

It provides:

- domain model contracts for email content
- email ports for send operations and content generation
- infrastructure adapters for email providers and Noop testing

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
- `@hexafy/email/infrastructure`

## Quick start

```ts
import type { EmailContentPort, EmailPort } from '@hexafy/email/domain';
import { EmailNoopAdapter } from '@hexafy/email/infrastructure';

const emailPort: EmailPort = new EmailNoopAdapter();
const emailContentPort: EmailContentPort = emailContent;

const email = await emailContentPort.generatePasswordReset(
  'user@example.com',
  'https://example.com/reset?token=abc123'
);

await emailPort.send(email);
```

## Public API at a glance

```ts
import type { Email, EmailContentPort, EmailPort } from '@hexafy/email/domain';
import { EmailNoopAdapter } from '@hexafy/email/infrastructure';
```

## Exported artifacts and usage

| Export             | Entry point       | What it is for                    | When to use                                        | Minimal usage                                     |
| ------------------ | ----------------- | --------------------------------- | -------------------------------------------------- | ------------------------------------------------- |
| `Email`            | `/domain`         | Email content model               | Typing email payloads and domain contracts         | Use as type for email objects                     |
| `EmailPort`        | `/domain`         | Email send operation contract     | Application code that sends emails                 | Depend on interface and inject adapter            |
| `EmailContentPort` | `/domain`         | Email content generation contract | Generating templated emails (password reset, etc.) | Depend on interface, implement content generation |
| `EmailNoopAdapter` | `/infrastructure` | In-memory no-op email adapter     | Tests and local prototypes without external email  | `new EmailNoopAdapter()`                          |

## How it fits with `@hexafy/core`

- Keep `EmailPort` and `EmailContentPort` dependencies in application/domain layers
- Keep provider-specific logic (SendGrid, SMTP, etc.) inside infrastructure adapters
- Use logging ports from `@hexafy/core` for email send operations
- Use this package as a companion domain boundary, not as a core-domain replacement

## Recommended usage

- Inject `EmailPort` into use cases that need to send emails
- Implement `EmailContentPort` with your template engine or provider
- Use `EmailNoopAdapter` in tests to avoid sending real emails
- Keep email templates externalized and tenant-scoped at app boundaries

## License

MIT
