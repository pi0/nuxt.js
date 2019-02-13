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

  registerWorker(worker) {
    this.workers.push(worker)

    // Simple event logger
    worker.on('event', (event) => {
      let message
      switch (event) {
        case 'status': message = `Status changed to ${worker.status}`; break
        default: message = `Emitted event ${event}`; break
      }
      console.log(`[${worker.id}]`, message) // eslint-disable-line no-console
    })

    // Broadcast messages to all workers
    worker.on('message', (message) => {
      for (const _worker of this.workers) {
        if (_worker !== worker) {
          _worker.sendMessage(message)
        }
      }
    })
  }

  async forkWorker(workerName, rootDir, options) {
    const worker = new ClusterWorker(workerName, rootDir, options)
    this.registerWorker(worker)
    await worker.start()
  }
}

export const manager = new Manager()
