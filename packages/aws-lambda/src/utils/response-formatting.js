/**
 * Format response for API Gateway
 *
 * Provides standard response formatting with content-type headers
 */
/** Format a success response */
export function formatSuccess(data, statusCode = 200) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            success: true,
            data
        })
    };
}
/** Format an error response */
export function formatError(error, statusCode = 500) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            success: false,
            error: error.message
        })
    };
}
/** Format a not found response */
export function formatNotFound(resource) {
    return {
        statusCode: 404,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            success: false,
            error: resource ? `${resource} not found` : 'Resource not found'
        })
    };
}
/** Format a bad request response */
export function formatBadRequest(message) {
    return {
        statusCode: 400,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            success: false,
            error: message
        })
    };
}
/** Format a unauthorized response */
export function formatUnauthorized(message) {
    return {
        statusCode: 401,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            success: false,
            error: message ?? 'Unauthorized'
        })
    };
}
/** Format a forbidden response */
export function formatForbidden(message) {
    return {
        statusCode: 403,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            success: false,
            error: message ?? 'Forbidden'
        })
    };
}
