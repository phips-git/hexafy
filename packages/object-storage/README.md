# @hexafy/object-storage

Object storage domain port and adapters for Hexafy applications, with S3 and no-op implementations.

## Why this package exists

This package defines a storage boundary (`ObjectStoragePort`) and provides adapter implementations so application/domain code depends on contracts, not SDK details.

It provides:

- domain model contracts for stored object metadata
- a domain storage port for put/get/delete/list/signed-url operations
- infrastructure adapters for AWS S3 and no-op testing

## Installation

```bash
npm install @hexafy/object-storage @hexafy/core @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
# or
bun add @hexafy/object-storage @hexafy/core @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
# or
yarn add @hexafy/object-storage @hexafy/core @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

Use subpath imports only:

- `@hexafy/object-storage/domain`
- `@hexafy/object-storage/infrastructure`

## Quick start

```ts
import type { ObjectStoragePort } from '@hexafy/object-storage/domain';
import { ObjectStorageNoopAdapter } from '@hexafy/object-storage/infrastructure';

const storage: ObjectStoragePort = new ObjectStorageNoopAdapter();
await storage.putObject('users/u1/avatar.png', new Uint8Array([1, 2, 3]));
```

## Public API at a glance

```ts
import type {
  CreateSignedUrlOptions,
  ObjectMetadata,
  ObjectStoragePort,
  PutObjectOptions,
  StoredObject
} from '@hexafy/object-storage/domain';
import {
  ObjectStorageAwsS3Adapter,
  type ObjectStorageAwsS3AdapterOptions,
  ObjectStorageNoopAdapter
} from '@hexafy/object-storage/infrastructure';
```

## Exported artifacts and usage

| Export                             | Entry point       | What it is for                     | When to use                                       | Minimal usage                                       |
| ---------------------------------- | ----------------- | ---------------------------------- | ------------------------------------------------- | --------------------------------------------------- |
| `ObjectStoragePort`                | `/domain`         | Storage boundary contract          | Application/domain code that needs object storage | Depend on interface and inject adapter              |
| `PutObjectOptions`                 | `/domain`         | Optional put-object options        | Typing write metadata such as content type        | Pass as third argument to `putObject`               |
| `CreateSignedUrlOptions`           | `/domain`         | Signed URL generation options      | Controlled GET/PUT signed URL creation            | Pass to `createSignedUrl`                           |
| `ObjectMetadata`                   | `/domain`         | Object metadata shape              | List and response typing without body bytes       | Use as return/value type                            |
| `StoredObject`                     | `/domain`         | Object metadata + body bytes       | Full object reads                                 | Use as return/value type                            |
| `ObjectStorageAwsS3Adapter`        | `/infrastructure` | AWS S3-backed storage adapter      | Production S3-backed storage implementation       | `new ObjectStorageAwsS3Adapter({ client, bucket })` |
| `ObjectStorageAwsS3AdapterOptions` | `/infrastructure` | Constructor options for S3 adapter | Type-safe S3 adapter configuration                | Provide `{ client, bucket }`                        |
| `ObjectStorageNoopAdapter`         | `/infrastructure` | In-memory no-op adapter            | Tests and local prototypes without external infra | `new ObjectStorageNoopAdapter()`                    |

## How it fits with `@hexafy/core`

- Keep `ObjectStoragePort` dependency in application/domain layers
- Keep AWS SDK-specific logic inside infrastructure adapters
- Use this package as a companion boundary package, not as a core-domain replacement

## Recommended usage

- Inject `ObjectStoragePort` into use cases/services
- Use `ObjectStorageNoopAdapter` in tests
- Keep storage key naming deterministic and tenant-scoped at app boundaries

## License

MIT
