import { resolve } from 'path'
import * as workers from './workers'
import { parseOptions } from './options'
import { log } from './utils/log'
import { hrToMs } from './utils/time'
import { isDirectorySync } from './utils/fs'
import assignDeep from './utils/assign-deep'

export async function entrypoint(options) {
  if (!options || Array.isArray(options)) {
    options = parseArgv(options)
  }

  // Try to get worker
  // eslint-disable-next-line import/namespace
  const worker = workers[options.workerName]
  if (!worker) {
    throw String('Unknown worker: ' + options.workerName)
  }

  // Validate rootDir to be a directory
  if (!isDirectorySync(options.rootDir)) {
    throw String(`Provided rootDir is not a valid directory: ${options.rootDir}`)
  }

  // Sync CWD with rootDir
  process.chdir(options.rootDir)
  options.rootDir = process.cwd()

  // Options from {rootDir}/nuxt.config
  const nuxtConfig = parseOptions('nuxt.config')
  const workerOptions = assignDeep({}, nuxtConfig, options)

  // Invoke worker
  await worker(workerOptions)

  // Show ready + time
  const time = hrToMs(process.hrtime(process.startTime))
  log(`Initialized in: ${time}ms`)
}

function parseArgv(_argv) {
  // Extract args
  const argv = _argv ? Array.from(_argv) : process.argv.slice(2)
  const [workerName, rootDir, ...optionsArr] = argv

  // Resolve and merge all options
  return assignDeep({},
    ...optionsArr.map(parseOptions),
    { rootDir, workerName }
  )
}
