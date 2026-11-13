/**
 * Parse JSON body from API Gateway event
 *
 * Handles null/empty body and provides type-safe parsing
 */
export function parseJsonBody<Input>(event: Record<string, unknown>): Input {
  if (!event || typeof event !== 'object' || !('body' in event)) {
    throw new Error('Request event missing body');
  }

  const eventBody = event['body'];
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
 *   ```typescript
 *   const query = parseQueryParameters<{ page: string; limit: string }>(event);
 *   const page = parseInt(query.page) || 1;
 *   ```;
 */
export function parseQueryParameters<
  T extends Record<string, string> = Record<string, string>
>(event: Record<string, unknown>): T {
  const value = event['queryParameters'] ?? {};
  return normalizeStringRecord<T>(value, 'queryParameters');
}

/**
 * Parse path parameters from API Gateway event
 *
 * @example
 *   ```typescript
 *   const params = parsePathParameters<{ userId: string }>(event);
 *   ```;
 */
export function parsePathParameters<
  T extends Record<string, string> = Record<string, string>
>(event: Record<string, unknown>): T {
  const value = event['pathParameters'] ?? {};
  return normalizeStringRecord<T>(value, 'pathParameters');
}

function normalizeStringRecord<T extends Record<string, string>>(
  value: unknown,
  fieldName: string
): T {
  if (value === null || value === undefined) {
    return {} as T;
  }

  if (typeof value !== 'object') {
    throw new Error(`${fieldName} must be an object`);
  }

  const output: Record<string, string> = {};

  for (const [key, entry] of Object.entries(value)) {
    if (entry === undefined || entry === null) {
      output[key] = '';
      continue;
    }
    if (typeof entry === 'string') {
      output[key] = entry;
      continue;
    }
    output[key] = String(entry);
  }

  return output as T;
}

/** Validate HTTP method */
export function validateHttpMethod(
  event: Record<string, unknown>,
  allowedMethods: string[]
): void {
  const httpMethod = event['httpMethod'];
  if (typeof httpMethod !== 'string') {
    throw new Error('HTTP method is missing');
  }

  if (!allowedMethods.includes(httpMethod.toUpperCase())) {
    throw new Error(
      `Method not allowed. Allowed: ${allowedMethods.join(', ')}`
    );
  }
}

/** Validate required headers */
export function validateRequiredHeaders(
  event: Record<string, unknown>,
  requiredHeaders: string[]
): void {
  const headersValue = event['headers'];
  if (headersValue === undefined || headersValue === null) {
    throw new Error('Missing headers');
  }

  const headers = normalizeStringRecord<Record<string, string>>(
    headersValue,
    'headers'
  );

  const missingHeaders = requiredHeaders.filter(
    (header) => !headers[header.toLowerCase()]
  );

  if (missingHeaders.length > 0) {
    throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
  }
}
