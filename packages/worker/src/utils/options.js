import { importESM } from './esm'
import { tryResolve } from './fs'

export function parseOptions(arg) {
  let opts = {}

  if (arg !== null && typeof arg === 'object') {
    opts = { ...arg }
  } else if (arg[0] === '{') {
    // Try to parse as JSON
    try {
      opts = JSON.parse(arg)
    } catch (error) {
      throw new Error('Error parsing options JSON: ' + error)
    }
  } else {
    // Try to resolve
    const optsPath = tryResolve(arg)
    if (optsPath) {
      opts = importESM(optsPath)
    }
  }

  return opts
}
