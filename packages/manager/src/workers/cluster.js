import cluster from 'cluster'
import consola from 'consola'
import { WORKER_STATUS } from '../consts'
import { BaseWorker } from './base'

export class ClusterWorker extends BaseWorker {
  constructor(workerName, rootDir = '.', options = {}) {
    super(workerName, rootDir, options)
  }

  get id() {
    return this.worker.process.pid
  }

  start() {
    // Setup master setting for entrypoint
    cluster.setupMaster({
      exec: require.resolve('@nuxt/worker/bin/nuxt-worker'),
      args: [
        this.workerName,
        this.rootDir,
        JSON.stringify(this.options)
      ]
    })

    // Fork worker
    this.worker = cluster.fork()
    this.worker.process.name = this.workerName

    // Listen on exit message from worker
    this._listenOnExit()

    // Update status
    this.statusCode = WORKER_STATUS.RUNNING
  }

  _listenOnExit() {
    this.worker.on('exit', (code, signal) => {
      // Update status
      this.statusCode = WORKER_STATUS.EXITED

      if (signal) {
        consola.debug(`Worker ${this.id} was killed by signal ${signal}`)
      } else if (code !== 0) {
        consola.debug(`Worker ${this.id} exited with error code: ${code}`)
      } else {
        consola.debug(`Worker ${this.id} finished successfully`)
      }
    })
  }
}
