import { ClusterWorker } from './workers/cluster'

class Manager {
  constructor() {
    this.workers = []
  }

  async forkWorker(workerName, rootDir, options) {
    const worker = new ClusterWorker(workerName, rootDir, options)
    this.workers.push(worker)
    await worker.start()
  }
}

export const manager = new Manager()
