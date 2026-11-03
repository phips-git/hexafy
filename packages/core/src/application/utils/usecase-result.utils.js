export function isSuccess(result) {
    return result.success === true;
}
export function isFailure(result) {
    return result.success === false;
}
export function success(value) {
    return { success: true, value };
}
export function failure(error) {
    return { success: false, error };
}
export function unwrap(result) {
    if (result.success) {
        return result.value;
    }
    throw result.error;
}
