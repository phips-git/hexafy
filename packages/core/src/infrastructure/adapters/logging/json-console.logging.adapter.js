function createLogEntry(level, message, component, context) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(component && { component })
  };
  if (context) {
    const seen = new WeakSet();
    for (const [key, value] of Object.entries(context)) {
      if (key in entry) continue;
      entry[key] = normalizeLogValue(value, seen);
    }
  }
  try {
    return JSON.stringify(entry);
  } catch {
    return JSON.stringify({
      timestamp: entry['timestamp'],
      level: entry['level'],
      message: entry['message'],
      component: entry['component'],
      _serializationError: 'Failed to serialize full log entry'
    });
  }
}
const RESERVED_ERROR_KEYS = new Set([
  'name',
  'message',
  'stack',
  'cause',
  'logLevel'
]);
function normalizeErrorForLog(error, seen = new WeakSet()) {
  if (seen.has(error)) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      _circular: true
    };
  }
  seen.add(error);
  const normalized = {
    name: error.name,
    message: error.message,
    stack: error.stack
  };
  for (const [key, value] of Object.entries(error)) {
    if (RESERVED_ERROR_KEYS.has(key)) {
      continue;
    }
    normalized[key] = normalizeLogValue(value, seen);
  }
  const cause = error.cause;
  if (cause instanceof Error) {
    normalized['cause'] = normalizeErrorForLog(cause, seen);
  }
  return normalized;
}
function normalizeLogValue(value, seen) {
  if (value instanceof Error) {
    return normalizeErrorForLog(value, seen);
  }
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (seen.has(value)) {
    return '[Circular]';
  }
  seen.add(value);
  if (Array.isArray(value)) {
    return value.map((item) => normalizeLogValue(item, seen));
  }
  if (!isPlainObject(value)) {
    return value;
  }
  const normalized = {};
  for (const [key, nestedValue] of Object.entries(value)) {
    normalized[key] = normalizeLogValue(nestedValue, seen);
  }
  return normalized;
}
function isPlainObject(value) {
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
export const createConsoleLogger = (component) => ({
  info: (message, context) =>
    console.info(createLogEntry('info', message, component, context)),
  debug: (message, context) =>
    console.debug(createLogEntry('debug', message, component, context)),
  warn: (message, context) =>
    console.warn(createLogEntry('warn', message, component, context)),
  error: (message, context) =>
    console.error(createLogEntry('error', message, component, context))
});
