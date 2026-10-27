/**
 * Parse JSON body from API Gateway event
 *
 * Handles null/empty body and provides type-safe parsing
 */
export function parseJsonBody<Input>(event: unknown): Input {
  if (!event || typeof event !== 'object' || !('body' in event)) {
    throw new Error('Request event missing body');
  }

  const eventBody = (event as Record<string, unknown>).body;
  if (!eventBody) {
    throw new Error('Request body is required');
  }

  if (typeof eventBody !== 'string') {
    throw new Error('Request body must be a string');
  }

  try {
    return JSON.parse(eventBody) as Input;
  } catch {
    throw new Error('Invalid JSON in request body');
  }
}

/**
 * Parse query parameters from API Gateway event
 *
 * @example
 * ```typescript
 * const query = parseQueryParameters<{ page: string; limit: string }>(event);
 * const page = parseInt(query.page) || 1;
 * ```
 */
export function parseQueryParameters<
  T extends Record<string, string> = Record<string, string>
>(event: Record<string, unknown>): T {
  return (event.queryParameters ?? {}) as T;
}

/**
 * Parse path parameters from API Gateway event
 *
 * @example
 * ```typescript
 * const params = parsePathParameters<{ userId: string }>(event);
 * ```
 */
export function parsePathParameters<
  T extends Record<string, string> = Record<string, string>
>(event: Record<string, unknown>): T {
  return (event.pathParameters ?? {}) as T;
}

/**
 * Validate HTTP method
 */
export function validateHttpMethod(event: Record<string, unknown>, allowedMethods: string[]): void {
  const httpMethod = event.httpMethod as string;
  if (!httpMethod || !allowedMethods.includes(httpMethod.toUpperCase())) {
    throw new Error(`Method not allowed. Allowed: ${allowedMethods.join(', ')}`);
  }
}

/**
 * Validate required headers
 */
export function validateRequiredHeaders(
  event: Record<string, unknown>,
  requiredHeaders: string[]
): void {
  const headers = event.headers as Record<string, string> | undefined;
  if (!headers) {
    throw new Error('Missing headers');
  }

  const missingHeaders = requiredHeaders.filter(
    (header) => !headers[header.toLowerCase()]
  );

  if (missingHeaders.length > 0) {
    throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
  }
}
