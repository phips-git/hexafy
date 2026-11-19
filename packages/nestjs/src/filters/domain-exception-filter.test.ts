import { describe, expect, test } from 'bun:test';

import { ConflictError, NotFoundError, ValidationError } from '../domain';
import { HttpForbiddenError, HttpUnauthorizedError } from '../domain/errors';
import {
  DomainExceptionFilter,
  HttpExceptionFilter,
  UnhandledExceptionFilter
} from './domain-exception-filter';

describe('HttpExceptionFilter', () => {
  test('returns 401 for HttpUnauthorizedError', () => {
    const filter = new HttpExceptionFilter();
    const exception = new HttpUnauthorizedError('Invalid token');
    const mockHost = createMockArgumentsHost();

    filter.catch(exception, mockHost as never);

    const call = (mockHost as { response: { statusCalls: number[] } }).response
      .statusCalls[0];
    expect(call).toEqual(401);
  });

  test('returns 403 for HttpForbiddenError', () => {
    const filter = new HttpExceptionFilter();
    const exception = new HttpForbiddenError('Insufficient permissions');
    const mockHost = createMockArgumentsHost();

    filter.catch(exception, mockHost as never);

    const call = (mockHost as { response: { statusCalls: number[] } }).response
      .statusCalls[0];
    expect(call).toEqual(403);
  });
});

describe('DomainExceptionFilter', () => {
  test('returns 400 for ValidationError', () => {
    const filter = new DomainExceptionFilter();
    const exception = new ValidationError('Invalid input');
    const mockHost = createMockArgumentsHost();

    filter.catch(exception, mockHost as never);

    const call = (mockHost as { response: { statusCalls: number[] } }).response
      .statusCalls[0];
    expect(call).toEqual(400);
  });

  test('returns 404 for NotFoundError', () => {
    const filter = new DomainExceptionFilter();
    const exception = new NotFoundError('Resource not found');
    const mockHost = createMockArgumentsHost();

    filter.catch(exception, mockHost as never);

    const call = (mockHost as { response: { statusCalls: number[] } }).response
      .statusCalls[0];
    expect(call).toEqual(404);
  });

  test('returns 409 for ConflictError', () => {
    const filter = new DomainExceptionFilter();
    const exception = new ConflictError('Resource already exists');
    const mockHost = createMockArgumentsHost();

    filter.catch(exception, mockHost as never);

    const call = (mockHost as { response: { statusCalls: number[] } }).response
      .statusCalls[0];
    expect(call).toEqual(409);
  });

  test('returns 400 for generic ApplicationError', () => {
    const filter = new DomainExceptionFilter();
    const exception = new HttpForbiddenError('Some error');
    const mockHost = createMockArgumentsHost();

    filter.catch(exception, mockHost as never);

    const call = (mockHost as { response: { statusCalls: number[] } }).response
      .statusCalls[0];
    expect(call).toEqual(403);
  });

  test('includes error code and message in response', () => {
    const filter = new DomainExceptionFilter();
    const exception = new ValidationError('Invalid email');
    const mockHost = createMockArgumentsHost();

    filter.catch(exception, mockHost as never);

    const jsonCall = (mockHost as { response: { jsonCalls: MockJsonCall[] } })
      .response.jsonCalls[0];
    expect(jsonCall).toBeDefined();
    expect(jsonCall!.success).toBe(false);
    expect(jsonCall!.error.code).toBe('VALIDATION_ERROR');
    expect(jsonCall!.error.message).toBe('Invalid email');
  });

  test('includes context in response when available', () => {
    const filter = new DomainExceptionFilter();
    const exception = new ValidationError('Invalid input', {
      context: { field: 'email' }
    });
    const mockHost = createMockArgumentsHost();

    filter.catch(exception, mockHost as never);

    const jsonCall = (mockHost as { response: { jsonCalls: MockJsonCall[] } })
      .response.jsonCalls[0];
    expect(jsonCall).toBeDefined();
    expect(jsonCall!.error.context).toEqual({ field: 'email' });
  });
});

describe('UnhandledExceptionFilter', () => {
  test('returns 500 for unhandled errors', () => {
    const filter = new UnhandledExceptionFilter();
    const exception = new Error('Unexpected error');
    const mockHost = createMockArgumentsHost();

    filter.catch(exception, mockHost as never);

    const call = (mockHost as { response: { statusCalls: number[] } }).response
      .statusCalls[0];
    expect(call).toEqual(500);
  });

  test('returns consistent error response', () => {
    const filter = new UnhandledExceptionFilter();
    const exception = new Error('Something went wrong');
    const mockHost = createMockArgumentsHost();

    filter.catch(exception, mockHost as never);

    const jsonCall = (mockHost as { response: { jsonCalls: MockJsonCall[] } })
      .response.jsonCalls[0];
    expect(jsonCall).toBeDefined();
    expect(jsonCall!.success).toBe(false);
    expect(jsonCall!.error.code).toBe('INTERNAL_SERVER_ERROR');
    expect(jsonCall!.error.message).toBe('Internal server error');
  });
});

interface MockJsonCall {
  success: boolean;
  error: {
    code: string;
    message: string;
    context?: unknown;
  };
}

interface MockResponse {
  statusCalls: number[];
  jsonCalls: MockJsonCall[];
  status(code: number): MockResponse;
  json(data: MockJsonCall): MockResponse;
}

function createMockArgumentsHost(): unknown {
  const response: MockResponse = {
    statusCalls: [],
    jsonCalls: [],
    status(code: number): MockResponse {
      this.statusCalls.push(code);
      return this;
    },
    json(data: MockJsonCall): MockResponse {
      this.jsonCalls.push(data);
      return this;
    }
  };

  return {
    switchToHttp: () => ({
      getResponse: () => response
    }),
    response,
    getArgs: () => [],
    getArgByIndex: () => null as never,
    switchToRpc: () => ({}) as never,
    switchToWs: () => ({}) as never,
    getType: () => 'http'
  };
}
