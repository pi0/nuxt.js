import cluster from 'cluster'
import { WORKER_STATUS } from '../consts'
import { BaseWorker } from './base'

export class ClusterWorker extends BaseWorker {
  constructor(workerName, rootDir = '.', options = {}) {
    super(workerName, rootDir, options)
  }

  get id() {
    return this.worker.process.pid || -1
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

    // Setup listeners
    this._listenOnExit()
    this._listenOnMessage()

    // Update status
    this.statusCode = WORKER_STATUS.RUNNING
  }

  _listenOnMessage() {
    this.worker.on('message', (message) => {
      // Emit message event
      this.emit('message', message)
    })
  }

  _listenOnExit() {
    this.worker.on('exit', (code, signal) => {
      // Update status
      this.statusCode = WORKER_STATUS.EXITED

      // Emit exit event
      this.emit('exit', code, signal)
    })
  }

  sendMessage(message) {
    this.worker.send(message)
  }
}
