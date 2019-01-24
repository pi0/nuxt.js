import { lstatSync } from 'fs'
import * as workers from './workers'
import { parseOptions } from './options'
import { log } from './utils/log'
import { hrToMs } from './utils/time'
import assignDeep from './utils/assign-deep'

export async function entrypoint(options) {
  // Read argv if no options provided or is array
  if (!options || Array.isArray(options)) {
    options = parseArgv(options)
  }

  // Process title
  process.title = `nuxt-worker-${process.pid}`

  // Process start time
  if (!process.startTime) {
    process.startTime = process.hrtime()
  }

  // Try to get worker
  // eslint-disable-next-line import/namespace
  const worker = workers[options.worker]
  if (!worker) {
    throw String('Unknown worker: ' + options.worker)
  }

  // Update process title
  process.title += '-' + options.worker

  // Validate rootDir to be a directory
  if (!lstatSync(options.rootDir).isDirectory()) {
    throw String(`Provided rootDir is not a valid directory (${options.rootDir})`)
  }

  // Chdir into rootDir
  process.chdir(options.rootDir)
  log('Working directory: ' + process.cwd())

  // Options
  const _options = parseOptions('nuxt.config')
  if (options.options) {
    assignDeep(_options, options.options)
  }

  // Invoke worker
  await worker(_options)

  // Show ready + time
  const time = hrToMs(process.hrtime(process.startTime))
  log(`Initialized in: ${time}ms`)
}

function parseArgv(_argv) {
  const argv = _argv ? Array.from(_argv) : process.argv.slice(2)

  if (argv.length < 2) {
    throw String(`Invalid number of arguments. Usage: <worker> <rootDir> [options]...`)
  }

  const [worker, rootDir, ...config] = argv

  return {
    worker,
    rootDir,
    config: assignDeep({}, ...config.map(parseOptions))
  }
}
