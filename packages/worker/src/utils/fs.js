import { resolve, relative } from 'path'
import { lstatSync } from 'fs'

export function isDirectorySync(path) {
  try {
    return lstatSync(path).isDirectory()
  } catch (e) {
    return false
  }
}

export function tryResolve(p) {
  try {
    return require.resolve(resolve(process.cwd(), p))
  } catch (e) {
    return null
  }
}

export function relativeToCWD(p) {
  return relative('.', p)
}
