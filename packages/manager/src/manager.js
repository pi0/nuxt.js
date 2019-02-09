import Table from 'cli-table'
import { ClusterWorker } from './workers/cluster'

export class Manager {
  constructor() {
    this.workers = []
  }

  showStatus() {
    const table = new Table({
      head: ['Name', 'ID', 'Status']
    })
    for (const worker of this.workers) {
      table.push([worker.workerName, worker.id, worker.status])
    }
    console.log(table.toString()) // eslint-disable-line no-console
  }

  async forkWorker(workerName, rootDir, options) {
    const worker = new ClusterWorker(workerName, rootDir, options)
    this.workers.push(worker)
    await worker.start()
  }
}

export const manager = new Manager()
