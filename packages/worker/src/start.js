import { parseOptions } from './utils/options'
import { isDirectorySync } from './utils/fs'
import { ProcessBridge } from './bridges'

export async function _startWorker(worker, options) {
  // Extract args
  const [rootDir = '.', optsArg = '{}', nuxtOptsArg = 'nuxt.config'] = process.argv.slice(2)

  // Parse and merge options
  options = {
    ...parseOptions(nuxtOptsArg),
    ...parseOptions(optsArg),
    rootDir
  }

  // Validate rootDir to be a directory
  if (!isDirectorySync(options.rootDir)) {
    throw String('Provided rootDir is not a valid directory: ' + options.rootDir)
  }

  // Sync CWD with rootDir
  process.chdir(options.rootDir)
  options.rootDir = process.cwd()

  // Create a process bridge
  const bridge = new ProcessBridge()

  // Invoke worker
  try {
    await worker.run(options, bridge)
  } catch (error) {
    bridge.onError(error)
    bridge.close(1)
  }
}

export async function startWorker(...args) {
  try {
    await _startWorker(...args)
  } catch (error) {
    console.error(error) // eslint-disable-line no-console
    process.exit(2)
  }
}
