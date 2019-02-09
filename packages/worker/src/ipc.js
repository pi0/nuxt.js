import cluster from 'cluster'
import { log } from './utils/log'

export class IPC {
  constructor() {
    this.listenOnExit()
  }

  listenOnExit() {
    cluster.on('exit', (worker, code, signal) => {
      if (code === 0) {
        log(`Worker ${worker.process.pid} finished successfully.`)
      } else {
        log(`Worker ${worker.process.pid} ended with error code ${code}.`)
      }
    })
  }
}

export const ipc = new IPC()
