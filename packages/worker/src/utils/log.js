function _log(loggerFn, ...args) {
  loggerFn(`[${process.title}]`, ...args)
}

export function log(...args) {
  // eslint-disable-next-line no-console
  _log(console.log, ...args)
}

export function logError(...args) {
  // eslint-disable-next-line no-console
  _log(console.error, '[ERR]', ...args)
}
