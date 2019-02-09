import { Worker } from './worker'

class Manager {
  constructor() {
    this.workers = []
  }

  async forkWorker(workerName, rootDir, options) {
    const worker = new Worker(workerName, rootDir, options)
    this.workers.push(worker)
    await worker.start()
  }
}

export const manager = new Manager()
