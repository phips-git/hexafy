import { describe, expect, test } from 'bun:test';

import {
  parseJsonBody,
  parsePathParameters,
  parseQueryParameters,
  validateHttpMethod,
  validateRequiredHeaders
} from './input-parsing';

describe('parseJsonBody', () => {
  test('parses valid JSON body', () => {
    const event = { body: '{"name": "John", "age": 30}' };
    const result = parseJsonBody<{ name: string; age: number }>(event);

    expect(result).toEqual({ name: 'John', age: 30 });
  });

  test('handles null body', () => {
    const event = { body: null };

    expect(() => parseJsonBody(event)).toThrow('Request body is required');
  });

  test('handles undefined body', () => {
    const event = { body: undefined };

    expect(() => parseJsonBody(event)).toThrow('Request body is required');
  });

  test('handles missing body field', () => {
    const event = {};

    expect(() => parseJsonBody(event)).toThrow('Request event missing body');
  });

  test('handles empty string body', () => {
    const event = { body: '' };

    expect(() => parseJsonBody(event)).toThrow('Invalid JSON in request body');
  });

  test('handles invalid JSON', () => {
    const event = { body: 'not json' };

    expect(() => parseJsonBody(event)).toThrow('Invalid JSON in request body');
  });

  test('handles non-string body', () => {
    const event = { body: 123 };

    expect(() => parseJsonBody(event)).toThrow('Request body must be a string');
  });

  test('parses array body', () => {
    const event = { body: '[1, 2, 3]' };
    const result = parseJsonBody<number[]>(event);

    expect(result).toEqual([1, 2, 3]);
  });

  test('preserves nested objects', () => {
    const event = {
      body: '{"user": {"name": "John", "address": {"city": "NYC"}}}'
    };
    const result = parseJsonBody<{
      user: { name: string; address: { city: string } };
    }>(event);

    expect(result.user.name).toBe('John');
    expect(result.user.address.city).toBe('NYC');
  });
});

describe('parseQueryParameters', () => {
  test('parses query parameters', () => {
    const event = {
      queryParameters: { page: '1', limit: '10', search: 'test' }
    };
    const result = parseQueryParameters(event);

    expect(result).toEqual({ page: '1', limit: '10', search: 'test' });
  });

  test('returns empty object for null queryParameters', () => {
    const event = { queryParameters: null };
    const result = parseQueryParameters(event);

    expect(result).toEqual({});
  });

  test('returns empty object for undefined queryParameters', () => {
    const event = { queryParameters: undefined };
    const result = parseQueryParameters(event);

    expect(result).toEqual({});
  });

  test('returns empty object when field missing', () => {
    const event = {};
    const result = parseQueryParameters(event);

    expect(result).toEqual({});
  });

  test('converts non-string values to strings', () => {
    const event = {
      queryParameters: { page: 1, limit: 10 } as unknown as Record<
        string,
        string
      >
    };
    const result = parseQueryParameters(event);

    expect(result).toEqual({ page: '1', limit: '10' });
  });

  test('handles null/undefined values in query params', () => {
    const event = {
      queryParameters: {
        page: '1',
        optional: null,
        another: undefined
      } as unknown as Record<string, string>
    };
    const result = parseQueryParameters(event);

    expect(result).toEqual({ page: '1', optional: '', another: '' });
  });

  test('handles case sensitivity', () => {
    const event = { queryParameters: { Page: '1', LIMIT: '10' } };
    const result = parseQueryParameters(event);

    expect(result).toEqual({ Page: '1', LIMIT: '10' });
  });
});

describe('parsePathParameters', () => {
  test('parses path parameters', () => {
    const event = {
      pathParameters: { userId: '123', resourceId: 'abc' }
    };
    const result = parsePathParameters(event);

    expect(result).toEqual({ userId: '123', resourceId: 'abc' });
  });

  test('returns empty object for null pathParameters', () => {
    const event = { pathParameters: null };
    const result = parsePathParameters(event);

    expect(result).toEqual({});
  });

  test('returns empty object for undefined pathParameters', () => {
    const event = { pathParameters: undefined };
    const result = parsePathParameters(event);

    expect(result).toEqual({});
  });

  test('handles single path parameter', () => {
    const event = { pathParameters: { id: '123' } };
    const result = parsePathParameters(event);

    expect(result).toEqual({ id: '123' });
  });

  test('handles missing path parameters field', () => {
    const event = {};
    const result = parsePathParameters(event);

    expect(result).toEqual({});
  });
});

describe('validateHttpMethod', () => {
  test('accepts valid HTTP method', () => {
    const event = { httpMethod: 'POST' };
    const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'];

    expect(() => validateHttpMethod(event, allowedMethods)).not.toThrow();
  });

  test('handles case insensitivity', () => {
    const event = { httpMethod: 'post' };
    const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'];

    expect(() => validateHttpMethod(event, allowedMethods)).not.toThrow();
  });

  test('rejects invalid HTTP method', () => {
    const event = { httpMethod: 'PATCH' };
    const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'];

    expect(() => validateHttpMethod(event, allowedMethods)).toThrow(
      'Method not allowed'
    );
  });

  test('rejects missing HTTP method', () => {
    const event = { httpMethod: undefined };
    const allowedMethods = ['GET'];

    expect(() => validateHttpMethod(event, allowedMethods)).toThrow(
      'HTTP method is missing'
    );
  });

  test('rejects null HTTP method', () => {
    const event = { httpMethod: null };
    const allowedMethods = ['GET'];

    expect(() => validateHttpMethod(event, allowedMethods)).toThrow(
      'HTTP method is missing'
    );
  });

  test('rejects non-string HTTP method', () => {
    const event = { httpMethod: 123 };
    const allowedMethods = ['GET'];

    expect(() => validateHttpMethod(event, allowedMethods)).toThrow(
      'HTTP method is missing'
    );
  });

  test('lists allowed methods in error', () => {
    const event = { httpMethod: 'DELETE' };
    const allowedMethods = ['GET', 'POST', 'PUT'];

    expect(() => validateHttpMethod(event, allowedMethods)).toThrow(
      'Allowed: GET, POST, PUT'
    );
  });
});

describe('validateRequiredHeaders', () => {
  test('accepts all required headers', () => {
    const event = {
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer token'
      }
    };
    const requiredHeaders = ['Content-Type', 'Authorization'];

    expect(() => validateRequiredHeaders(event, requiredHeaders)).not.toThrow();
  });

  test('handles case insensitivity', () => {
    const event = {
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer token'
      }
    };
    const requiredHeaders = ['content-type', 'authorization'];

    expect(() => validateRequiredHeaders(event, requiredHeaders)).not.toThrow();
  });

  test('rejects missing required headers', () => {
    const event = {
      headers: {
        'content-type': 'application/json'
      }
    };
    const requiredHeaders = ['Authorization'];

    expect(() => validateRequiredHeaders(event, requiredHeaders)).toThrow(
      'Missing required headers: Authorization'
    );
  });

  test('handles null headers', () => {
    const event = { headers: null };
    const requiredHeaders = ['Content-Type'];

    expect(() => validateRequiredHeaders(event, requiredHeaders)).toThrow(
      'Missing headers'
    );
  });

  test('handles undefined headers', () => {
    const event = { headers: undefined };
    const requiredHeaders = ['Content-Type'];

    expect(() => validateRequiredHeaders(event, requiredHeaders)).toThrow(
      'Missing headers'
    );
  });

  test('handles missing headers field', () => {
    const event = {};
    const requiredHeaders = ['Content-Type'];

    expect(() => validateRequiredHeaders(event, requiredHeaders)).toThrow(
      'Missing headers'
    );
  });

  test('handles empty headers object', () => {
    const event = { headers: {} };
    const requiredHeaders = ['Content-Type'];

    expect(() => validateRequiredHeaders(event, requiredHeaders)).toThrow(
      'Missing required headers: Content-Type'
    );
  });

  test('handles headers with non-string values', () => {
    const event = {
      headers: { 'content-type': 123 } as unknown as Record<string, string>
    };
    const requiredHeaders = ['Content-Type'];

    expect(() => validateRequiredHeaders(event, requiredHeaders)).not.toThrow();
  });

  test('accepts partial headers when some required', () => {
    const event = {
      headers: {
        'content-type': 'application/json'
      }
    };
    const requiredHeaders = ['Content-Type'];

    expect(() => validateRequiredHeaders(event, requiredHeaders)).not.toThrow();
  });
});
