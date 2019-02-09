import { Worker } from './worker'

class Manager {
  forkWorker(workerName, rootDir, options) {
    const worker = new Worker(workerName, rootDir, options)
    worker.fork()

    return Promise.resolve()
  }
}

export const manager = new Manager()
