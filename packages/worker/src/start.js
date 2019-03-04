import defu from 'defu'
import { parseOptions } from './utils/options'
import { isDirectorySync } from './utils/fs'

import * as workers from './workers'
import { WorkerBridge } from './bridge'

export async function startWorker(options) {
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
  const workerOptions = defu(options, nuxtConfig)

  // Create a bridge
  const bridge = new WorkerBridge()

  // Invoke worker
  try {
    await worker(workerOptions, bridge)
  } catch (error) {
    bridge.onError(error)
    bridge.exit(1)
  }
}

function parseArgv(_argv) {
  // Extract args
  const argv = _argv ? Array.from(_argv) : process.argv.slice(2)
  const [workerName, rootDir, options] = argv

  // Resolve and merge all options
  return defu({ rootDir, workerName }, parseOptions(options))
}
