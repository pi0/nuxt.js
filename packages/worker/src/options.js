import { resolve, relative } from 'path'
import { log } from './utils/log'

export function parseOptions(str = '') {
  let opts

  if (str !== null && typeof str === 'object') {
    opts = { ...str }
  } else if (str[0] === '{') {
    // Try parse as JSON
    try {
      opts = JSON.parse(str)
    } catch (error) {
      throw String('Error parsing options JSON: ' + error)
    }
  } else {
    // Try to resolve
    const optsPath = tryResolve(str)
    if (optsPath) {
      log('Loading config from: ' + relativeToCWD(optsPath))
      opts = require('esm')(module)(optsPath)
      opts = opts.default || opts || {}
    }
  }

  return opts
}

function tryResolve(p) {
  try {
    return require.resolve(resolve(process.cwd(), p))
  } catch (e) {
    return null
  }
}

function relativeToCWD(p) {
  return relative('.', p)
}
