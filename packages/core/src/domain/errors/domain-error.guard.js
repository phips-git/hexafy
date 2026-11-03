import { ApplicationError } from './application.error';
const KNOWN_DOMAIN_ERROR_NAMES = new Set([
    'ApplicationError',
    'ValidationError',
    'NotFoundError',
    'ConflictError',
    'UnauthorizedError',
    'ForbiddenError',
    'InvariantError',
    'InfrastructureError',
    'ExternalServiceError',
    'InternalServerError'
]);
const DOMAIN_ERROR_CODE_ALIASES = {
    UNAUTHORIZED: 'UNAUTHORIZED_ERROR',
    FORBIDDEN: 'FORBIDDEN_ERROR',
    NOT_FOUND: 'NOT_FOUND_ERROR',
    VALIDATION: 'VALIDATION_ERROR',
    CONFLICT: 'CONFLICT_ERROR',
    EXTERNAL_SERVICE: 'EXTERNAL_SERVICE_ERROR',
    INTERNAL: 'INTERNAL_SERVER_ERROR',
    INFRASTRUCTURE: 'INFRASTRUCTURE_ERROR'
};
export function isDomainError(value) {
    if (!(value instanceof Error)) {
        return false;
    }
    if (value instanceof ApplicationError) {
        return true;
    }
    if (KNOWN_DOMAIN_ERROR_NAMES.has(value.name)) {
        return true;
    }
    const code = readCode(value);
    return code !== undefined;
}
export function getDomainErrorCode(error) {
    const explicitCode = readCode(error);
    if (explicitCode) {
        return DOMAIN_ERROR_CODE_ALIASES[explicitCode] ?? explicitCode;
    }
    const nameAsCode = toCodeFromName(error.name);
    return nameAsCode ?? undefined;
}
function readCode(error) {
    const code = error.code;
    if (typeof code !== 'string' || code.trim().length === 0) {
        return undefined;
    }
    return code.trim().toUpperCase();
}
function toCodeFromName(name) {
    if (!KNOWN_DOMAIN_ERROR_NAMES.has(name)) {
        return null;
    }
    if (name === 'ApplicationError') {
        return 'APPLICATION_ERROR';
    }
    return name
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
        .replace(/_ERROR$/, '')
        .toUpperCase()
        .concat('_ERROR');
}
