import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';
import type {
  DeleteObjectCommandOutput,
  GetObjectCommandOutput,
  HeadObjectCommandOutput,
  ListObjectsV2Output,
  PutObjectCommandOutput
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { InfrastructureError, NotFoundError } from '@hexafy/core/domain';

import type { ObjectMetadata, StoredObject } from '../../domain/models';
import type {
  CreateSignedUrlOptions,
  ObjectStoragePort,
  PutObjectOptions
} from '../../domain/ports';

export interface ObjectStorageAwsS3AdapterOptions {
  client: S3Client;
  bucket: string;
}

type S3Command =
  | PutObjectCommand
  | GetObjectCommand
  | DeleteObjectCommand
  | HeadObjectCommand
  | ListObjectsV2Command;

type S3CommandOutput =
  | PutObjectCommandOutput
  | GetObjectCommandOutput
  | DeleteObjectCommandOutput
  | HeadObjectCommandOutput
  | ListObjectsV2Output;

type S3StreamBody =
  | Uint8Array
  | Buffer
  | Blob
  | string
  | ReadableStream<Uint8Array>
  | NodeJS.ReadableStream
  | AsyncIterable<Uint8Array | Buffer | string | ArrayBufferView>
  | null
  | undefined;

export class ObjectStorageAwsS3Adapter implements ObjectStoragePort {
  constructor(private readonly options: ObjectStorageAwsS3AdapterOptions) {}

  async putObject(
    key: string,
    body: Uint8Array | Blob,
    options?: PutObjectOptions
  ): Promise<ObjectMetadata> {
    const bodyBuffer = await this.toBuffer(body);

    await this.runOperation(
      new PutObjectCommand({
        Bucket: this.options.bucket,
        Key: key,
        Body: bodyBuffer,
        ContentType: options?.contentType
      })
    );

    return { key, size: bodyBuffer.byteLength, lastModified: null };
  }

  private async toBuffer(body: Uint8Array | Blob): Promise<Buffer> {
    if (body instanceof Uint8Array) return Buffer.from(body);
    const buffer = await body.arrayBuffer();
    return Buffer.from(new Uint8Array(buffer));
  }

  async getObject(key: string): Promise<StoredObject> {
    const response = (await this.runOperation(
      new GetObjectCommand({ Bucket: this.options.bucket, Key: key })
    )) as GetObjectCommandOutput;

    if (this.isNoSuchKeyException(response)) {
      throw new NotFoundError('Object not found', { context: { key } });
    }

    const bodyBytes = await this.readStream(response.Body as S3StreamBody);

    return {
      key,
      size: response.ContentLength ?? bodyBytes.byteLength,
      lastModified: response.LastModified ?? null,
      body: bodyBytes
    };
  }

  async deleteObject(key: string): Promise<void> {
    await this.runOperation(
      new DeleteObjectCommand({ Bucket: this.options.bucket, Key: key })
    );
  }

  async objectExists(key: string): Promise<boolean> {
    try {
      await this.runOperation(
        new HeadObjectCommand({ Bucket: this.options.bucket, Key: key })
      );
      return true;
    } catch (error) {
      if (this.isNoSuchKeyException(error)) return false;
      throw error;
    }
  }

  async listObjects(prefix: string): Promise<ObjectMetadata[]> {
    const results: ObjectMetadata[] = [];
    let continuationToken: string | undefined;

    do {
      const response = (await this.runOperation(
        new ListObjectsV2Command({
          Bucket: this.options.bucket,
          Prefix: prefix,
          ContinuationToken: continuationToken
        })
      )) as ListObjectsV2Output;

      for (const content of response.Contents ?? []) {
        if (content.Key && content.Size !== undefined && content.LastModified) {
          results.push({
            key: content.Key,
            size: content.Size,
            lastModified: content.LastModified
          });
        }
      }

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return results.sort((a, b) => a.key.localeCompare(b.key));
  }

  async createSignedUrl(
    key: string,
    options: CreateSignedUrlOptions
  ): Promise<string> {
    const command =
      options.method === 'PUT'
        ? new PutObjectCommand({ Bucket: this.options.bucket, Key: key })
        : new GetObjectCommand({ Bucket: this.options.bucket, Key: key });

    const url = await getSignedUrl(this.options.client, command, {
      expiresIn: options.expiresInSeconds
    });

    return url.toString();
  }

  private async runOperation(
    command: PutObjectCommand
  ): Promise<PutObjectCommandOutput>;
  private async runOperation(
    command: GetObjectCommand
  ): Promise<GetObjectCommandOutput>;
  private async runOperation(
    command: DeleteObjectCommand
  ): Promise<DeleteObjectCommandOutput>;
  private async runOperation(
    command: HeadObjectCommand
  ): Promise<HeadObjectCommandOutput>;
  private async runOperation(
    command: ListObjectsV2Command
  ): Promise<ListObjectsV2Output>;
  private async runOperation(command: S3Command): Promise<S3CommandOutput> {
    try {
      return (await this.options.client.send(
        command as never
      )) as S3CommandOutput;
    } catch (error) {
      throw new InfrastructureError('S3 operation failed', {
        cause: error,
        context: { operation: this.getOperationName(command) }
      });
    }
  }

  private getOperationName(command: S3Command): string {
    if (command instanceof PutObjectCommand) return 'put-object';
    if (command instanceof GetObjectCommand) return 'get-object';
    if (command instanceof DeleteObjectCommand) return 'delete-object';
    if (command instanceof HeadObjectCommand) return 'head-object';
    if (command instanceof ListObjectsV2Command) return 'list-objects';
    return 'unknown';
  }

  private isNoSuchKeyException(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      '$fault' in error &&
      error.$fault === 'client' &&
      'Name' in error &&
      error.Name === 'NoSuchKeyException'
    );
  }

  private async readStream(body: S3StreamBody): Promise<Uint8Array> {
    if (!body) return new Uint8Array(0);
    if (body instanceof Uint8Array) return body;
    if (Buffer.isBuffer(body)) {
      return new Uint8Array(body.buffer, body.byteOffset, body.byteLength);
    }
    if (typeof body === 'string') return new TextEncoder().encode(body);
    if (body instanceof Blob) {
      return new Uint8Array(await body.arrayBuffer());
    }

    const chunks: Uint8Array[] = [];
    if (typeof body === 'object' && 'getReader' in body) {
      const reader = body.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(this.toUint8Array(value));
          }
        }
      } finally {
        reader.releaseLock();
      }
    } else if (typeof body === 'object' && Symbol.asyncIterator in body) {
      for await (const chunk of body as AsyncIterable<
        Uint8Array | Buffer | string | ArrayBufferView
      >) {
        chunks.push(this.toUint8Array(chunk));
      }
    }

    if (chunks.length === 0) return new Uint8Array(0);
    if (chunks.length === 1) return chunks[0]!;

    const totalLength = chunks.reduce(
      (acc, chunk) => acc + chunk.byteLength,
      0
    );
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return result;
  }

  private toUint8Array(
    value: Uint8Array | Buffer | string | ArrayBufferView
  ): Uint8Array {
    if (value instanceof Uint8Array) return value;
    if (Buffer.isBuffer(value)) {
      return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    }
    if (typeof value === 'string') return new TextEncoder().encode(value);
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  }
}
