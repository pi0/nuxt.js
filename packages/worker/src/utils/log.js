function _log(loggerFn, ...args) {
  const id = process.name || process.id
  loggerFn(`[${id}]`, ...args)
}

export function debug(...args) {
  if (process.env.DEBUG) {
    // eslint-disable-next-line no-console
    _log(console.log, ...args)
  }
}

export function log(...args) {
  // eslint-disable-next-line no-console
  _log(console.log, ...args)
}

export function logError(...args) {
  // eslint-disable-next-line no-console
  _log(console.error, '[ERR]', ...args)
}
