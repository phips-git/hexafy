import { describe, expect, test } from 'bun:test';

import { UseCase } from '@hexafy/core/application';
import { ValidationError } from '@hexafy/core/domain';
import type { Context as LambdaContext } from 'aws-lambda';

import {
  createLambdaHandler,
  formatError,
  formatJsonResponse
} from './create-handler';

describe('createLambdaHandler', () => {
  test('returns success response when use case succeeds', async () => {
    class TestUseCase extends UseCase<
      { message: string },
      { greeting: string }
    > {
      protected async executeInternal(input: {
        message: string;
      }): Promise<{ greeting: string }> {
        return { greeting: `Hello, ${input.message}!` };
      }
    }

    const useCase = new TestUseCase();
    const handler = createLambdaHandler({
      useCase,
      inputTransformer: (event) => JSON.parse(event.body || '{}')
    });

    const event = {
      httpMethod: 'POST',
      path: '/test',
      body: JSON.stringify({ message: 'World' }),
      headers: {},
      queryParameters: null,
      pathParameters: null,
      stageVariables: null
    };

    const result = await handler(event, {} as LambdaContext);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.success).toBe(true);
    expect(body.data.greeting).toBe('Hello, World!');
  });

  test('handles domain errors correctly', async () => {
    class FailingUseCase extends UseCase<{ name: string }, void> {
      protected async executeInternal(input: { name: string }): Promise<void> {
        if (!input.name) {
          throw new ValidationError('Name is required');
        }
      }
    }

    const useCase = new FailingUseCase();
    const handler = createLambdaHandler({
      useCase,
      inputTransformer: (event) => JSON.parse(event.body || '{}')
    });

    const event = {
      httpMethod: 'POST',
      path: '/test',
      body: JSON.stringify({ name: '' }),
      headers: {},
      queryParameters: null,
      pathParameters: null,
      stageVariables: null
    };

    const result = await handler(event, {} as LambdaContext);

    expect(result.statusCode).toBe(400);
    const body = JSON.parse(result.body);
    expect(body.success).toBe(false);
    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.error).toContain('required');
  });

  test('allows custom response formatter', async () => {
    class TestUseCase extends UseCase<void, { result: string }> {
      protected async executeInternal(): Promise<{ result: string }> {
        return { result: 'success' };
      }
    }

    const useCase = new TestUseCase();
    const handler = createLambdaHandler({
      useCase,
      inputTransformer: () => ({}),
      responseFormatter: (output) => ({
        statusCode: 201,
        headers: { 'X-Custom': 'header' },
        body: JSON.stringify({ custom: output.result })
      })
    });

    const event = {
      httpMethod: 'POST',
      path: '/test',
      body: null,
      headers: {},
      queryParameters: null,
      pathParameters: null,
      stageVariables: null
    };

    const result = await handler(event, {} as LambdaContext);

    expect(result.statusCode).toBe(201);
    expect(result.headers?.['X-Custom']).toBe('header');
    const body = JSON.parse(result.body);
    expect(body.custom).toBe('success');
  });

  test('calls onError callback on error', async () => {
    let onErrorCalled = false;

    class FailingUseCase extends UseCase<void, void> {
      protected async executeInternal(): Promise<void> {
        throw new Error('Test error');
      }
    }

    const useCase = new FailingUseCase();
    const handler = createLambdaHandler({
      useCase,
      inputTransformer: () => ({}),
      onError: () => {
        onErrorCalled = true;
      }
    });

    const event = {
      httpMethod: 'POST',
      path: '/test',
      body: null,
      headers: {},
      queryParameters: null,
      pathParameters: null,
      stageVariables: null
    };

    await handler(event, {} as LambdaContext);

    expect(onErrorCalled).toBe(true);
  });

  test('handles context parameter correctly', async () => {
    class TestUseCase extends UseCase<
      { message: string },
      { greeting: string }
    > {
      protected async executeInternal(input: {
        message: string;
      }): Promise<{ greeting: string }> {
        return { greeting: `Hello, ${input.message}!` };
      }
    }

    const useCase = new TestUseCase();
    const handler = createLambdaHandler({
      useCase,
      inputTransformer: (event, context) => {
        // Verify context is passed
        expect(context).toBeDefined();
        return JSON.parse(event.body || '{}');
      }
    });

    const event = {
      httpMethod: 'POST',
      path: '/test',
      body: JSON.stringify({ message: 'World' }),
      headers: {},
      queryParameters: null,
      pathParameters: null,
      stageVariables: null
    };

    const context = {
      awsRequestId: 'test-request-id',
      callbackWaitsForEmptyEventLoop: true,
      functionName: 'test-function',
      functionVersion: '$LATEST',
      invokedFunctionArn: 'arn:test',
      memoryLimitInMB: '128',
      logGroupName: '/aws/lambda/test',
      logStreamName: '2024/01/01/[$LATEST]test',
      getRemainingTimeInMillis: () => 300000,
      done: () => {},
      fail: () => {},
      succeed: () => {}
    };

    await handler(event, context);
  });
});

describe('formatJsonResponse', () => {
  test('formats response with 200 status', () => {
    const response = formatJsonResponse({ data: 'test' });

    expect(response.statusCode).toBe(200);
    expect(response.headers?.['Content-Type']).toBe('application/json');
    const body = JSON.parse(response.body);
    expect(body.success).toBe(true);
    expect(body.data).toEqual({ data: 'test' });
  });

  test('serializes complex objects', () => {
    const response = formatJsonResponse({
      users: [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' }
      ],
      total: 2
    });

    const body = JSON.parse(response.body);
    expect(body.data.users).toHaveLength(2);
    expect(body.data.total).toBe(2);
  });
});

describe('formatError', () => {
  test('returns 400 for validation errors', () => {
    const error = new Error('Validation error: field is required');
    const response = formatError(error);

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.success).toBe(false);
    expect(body.error).toContain('required');
  });

  test('returns 404 for not found errors', () => {
    class NotFoundError extends Error {
      constructor(message: string) {
        super(message);
        this.name = 'NotFoundError';
      }
    }

    const error = new NotFoundError('Resource not found');
    const response = formatError(error);

    expect(response.statusCode).toBe(404);
    const body = JSON.parse(response.body);
    expect(body.success).toBe(false);
  });

  test('returns 500 for other errors', () => {
    const error = new Error('Internal server error');
    const response = formatError(error);

    expect(response.statusCode).toBe(500);
    const body = JSON.parse(response.body);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Internal server error');
  });

  test('returns 500 for domain errors', () => {
    const error = new ValidationError('Something went wrong');
    const response = formatError(error);

    expect(response.statusCode).toBe(400);
  });
});
