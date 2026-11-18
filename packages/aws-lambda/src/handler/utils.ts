import type { APIGatewayEvent } from './create-handler';

/**
 * Parse JSON body from API Gateway event
 *
 * @param event - The API Gateway event
 * @returns The parsed JSON body, or null if body is empty/invalid
 */
export function parseJsonBody(event: APIGatewayEvent): unknown | null {
  if (!event.body) {
    return null;
  }

  try {
    return JSON.parse(event.body);
  } catch {
    throw new Error('Invalid JSON in request body');
  }
}
