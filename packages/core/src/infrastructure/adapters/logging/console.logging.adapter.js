export const ConsoleLoggingAdapter = {
  info(message, data) {
    if (data === undefined || data === null) {
      console.log(message);
    } else {
      console.log(message, data);
    }
  },
  warn(message, data) {
    if (data === undefined || data === null) {
      console.warn(message);
    } else {
      console.warn(message, data);
    }
  },
  error(message, data) {
    if (data === undefined || data === null) {
      console.error(message);
    } else {
      console.error(message, data);
    }
  },
  debug(message, data) {
    if (data === undefined || data === null) {
      console.debug(message);
    } else {
      console.debug(message, data);
    }
  }
};
