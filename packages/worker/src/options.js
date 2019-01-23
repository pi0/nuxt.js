import { } from 'fs'
import { join, resolve, relative } from 'path'

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
    // Paths to try
    const tryPaths = [
      str,
      join(str, 'nuxt.config')
    ]

    // Try to resolve
    for (const tryPath of tryPaths) {
      const optsPath = tryResolve(tryPath)
      if (optsPath) {
        console.log('Loading config from: ' + relativeToCWD(optsPath))
        opts = require('esm')(module)(optsPath)
        opts = opts.default || opts || {}
        break
      }
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
