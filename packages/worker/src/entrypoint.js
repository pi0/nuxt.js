import { lstatSync } from 'fs'
import * as workers from './workers'
import { parseOptions } from './options'

export default async function entrypoint(_argv) {
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

  // Measure start time
  console.log(`Starting worker: ${workerName}`)
  const startedInMsg = `${workerName} worker started in`
  console.time(startedInMsg)

  // Validate rootDir to be a directory
  if (!lstatSync(rootDir).isDirectory()) {
    throw String(`Provided rootDir is not a valid directory (${rootDir})`)
  }

  // Chdir into rootDir
  process.chdir(rootDir)
  console.log('Working directory: ' + process.cwd())

  // Options
  const options = parseOptions(optionsStr)

  // Invoke worker
  await worker(options)

  // Show ready + time
  console.timeEnd(startedInMsg)
}
