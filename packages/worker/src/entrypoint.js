import { lstatSync } from 'fs'
import * as workers from './workers'
import { parseOptions } from './options'
import { log } from './utils/log'
import { hrToMs } from './utils/time'

export async function entrypoint(_argv) {
  // Process title
  process.title = `nuxt-worker-${process.pid}`

  // Process start time
  if (!process.startTime) {
    process.startTime = process.hrtime()
  }

  // Read from process.argv
  const argv = _argv ? Array.from(_argv) : process.argv.slice(2)

  // Args are in form of <worker> <rootDir> [options]
  if (argv.length !== 2 && argv.length !== 3) {
    throw String(`Invalid number of arguments. Usage: <worker> <rootDir> [options]`)
  }
  const [workerName, rootDir, optionsStr = 'nuxt.config'] = argv

  // Try to get worker
  // eslint-disable-next-line import/namespace
  const worker = workers[workerName]
  if (!worker) {
    throw String('Unknown worker: ' + workerName)
  }

  // Update process title
  process.title += '-' + workerName

  // Validate rootDir to be a directory
  if (!lstatSync(rootDir).isDirectory()) {
    throw String(`Provided rootDir is not a valid directory (${rootDir})`)
  }

  // Chdir into rootDir
  process.chdir(rootDir)
  log('Working directory: ' + process.cwd())

  // Options
  const options = parseOptions(optionsStr)

  // Invoke worker
  await worker(options)

  // Show ready + time
  const time = hrToMs(process.hrtime(process.startTime))
  log(`Initialized in: ${time}ms`)
}
