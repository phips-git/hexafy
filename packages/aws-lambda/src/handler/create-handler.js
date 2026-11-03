import { getDomainErrorCode, isDomainError } from '@hexafy/core/domain';
/**
 * Create a Lambda handler from a use case
 *
 * This is the primary entry point for using @hexafy/aws-lambda
 *
 * @example
 *   ```typescript
 *   export const handler = createLambdaHandler({
 *     useCase: new CreateUserUseCase(),
 *     inputTransformer: parseApiGatewayBody,
 *     responseFormatter: formatJsonResponse,
 *     errorFormatter: formatErrorResponse
 *   });
 *   ```;
 */
export function createLambdaHandler(config) {
    const { useCase, inputTransformer, responseFormatter = formatJsonResponse, errorFormatter = formatError, onError } = config;
    return async (event, context) => {
        // Transform event to use case input
        const input = inputTransformer(event, context);
        // Execute use case - returns Result
        const result = await useCase.execute(input);
        // Handle result
        if (result.success) {
            return responseFormatter(result.value);
        }
        // Format error response
        const error = result.error;
        // Log error if handler provided
        if (onError) {
            onError(error, context);
        }
        // Format error response
        const formattedError = errorFormatter(error);
        // For domain-like errors, include stable code metadata
        if (isDomainError(error)) {
            const code = getDomainErrorCode(error);
            const timestamp = readErrorTimestamp(error);
            formattedError.body = JSON.stringify({
                success: false,
                error: error.message,
                ...(code && { code }),
                ...(timestamp && { timestamp })
            });
        }
        return formattedError;
    };
}
function readErrorTimestamp(error) {
    const maybeTimestamp = error.timestamp;
    if (maybeTimestamp instanceof Date) {
        return maybeTimestamp.toISOString();
    }
    return undefined;
}
/** Standard JSON response formatter */
export function formatJsonResponse(output) {
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            success: true,
            data: output
        })
    };
}
/** Standard error response formatter */
export function formatError(error) {
    // Handle specific error types
    if (error.message.includes('400')) {
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
    if (error.message.includes('404')) {
        return {
            statusCode: 404,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
    // Default server error
    return {
        statusCode: 500,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            success: false,
            error: 'Internal server error'
        })
    };
}
