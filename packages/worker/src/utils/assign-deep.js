/*!
 * assign-deep <https://github.com/jonschlinkert/assign-deep>
 * assign-symbols <https://github.com/jonschlinkert/assign-symbols>
 *
 * Copyright (c) 2017-present, Jon Schlinkert.
 * Released under the MIT License.
 */

const toString = Object.prototype.toString
const isEnumerable = Object.prototype.propertyIsEnumerable
const getSymbols = Object.getOwnPropertySymbols

export default function assignDeep(target, ...args) {
  let i = 0
  if (isPrimitive(target)) target = args[i++]
  if (!target) target = {}
  for (; i < args.length; i++) {
    if (isObject(args[i])) {
      for (const key of Object.keys(args[i])) {
        if (isObject(target[key]) && isObject(args[i][key])) {
          assignDeep(target[key], args[i][key])
        } else {
          target[key] = args[i][key]
        }
      }
      assignSymbols(target, args[i])
    }
  }
  return target
}

function isObject(val) {
  return typeof val === 'function' || toString.call(val) === '[object Object]'
}

function isPrimitive(val) {
  return typeof val === 'object' ? val === null : typeof val !== 'function'
}

function assignSymbols(target, ...args) {
  if (!isObject(target)) {
    throw new TypeError('expected the first argument to be an object')
  }

  if (args.length === 0 || typeof Symbol !== 'function' || typeof getSymbols !== 'function') {
    return target
  }

  for (const arg of args) {
    const names = getSymbols(arg)

    for (const key of names) {
      if (isEnumerable.call(arg, key)) {
        target[key] = arg[key]
      }
    }
  }
  return target
}
