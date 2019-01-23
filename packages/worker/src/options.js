import { resolve, relative } from 'path'

export function parseOptions(str = '') {
  let opts = {}

  if (str[0] === '{') {
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
      console.log('Loading config from: ' + relativeToCWD(optsPath))
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
