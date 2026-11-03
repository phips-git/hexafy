/**
 * Parse JSON body from API Gateway event
 *
 * Handles null/empty body and provides type-safe parsing
 */
export function parseJsonBody(event) {
    if (!event || typeof event !== 'object' || !('body' in event)) {
        throw new Error('Request event missing body');
    }
    const eventBody = event.body;
    if (!eventBody) {
        throw new Error('Request body is required');
    }
    if (typeof eventBody !== 'string') {
        throw new Error('Request body must be a string');
    }
    try {
        return JSON.parse(eventBody);
    }
    catch {
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
export function parseQueryParameters(event) {
    return (event.queryParameters ?? {});
}
/**
 * Parse path parameters from API Gateway event
 *
 * @example
 *   ```typescript
 *   const params = parsePathParameters<{ userId: string }>(event);
 *   ```;
 */
export function parsePathParameters(event) {
    return (event.pathParameters ?? {});
}
/** Validate HTTP method */
export function validateHttpMethod(event, allowedMethods) {
    const httpMethod = event.httpMethod;
    if (!httpMethod || !allowedMethods.includes(httpMethod.toUpperCase())) {
        throw new Error(`Method not allowed. Allowed: ${allowedMethods.join(', ')}`);
    }
}
/** Validate required headers */
export function validateRequiredHeaders(event, requiredHeaders) {
    const headers = event.headers;
    if (!headers) {
        throw new Error('Missing headers');
    }
    const missingHeaders = requiredHeaders.filter((header) => !headers[header.toLowerCase()]);
    if (missingHeaders.length > 0) {
        throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
    }
}
