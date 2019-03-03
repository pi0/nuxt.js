import cluster from 'cluster'
import { WORKER_STATUS } from '../consts'
import { BaseRunner } from './base'

export class ClusterRunner extends BaseRunner {
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

    // Setup listeners
    this._listenOnExit()
    this._listenOnMessage()

    // Update status
    this.statusCode = WORKER_STATUS.STARTED
  }

  _listenOnMessage() {
    this.worker.on('message', (msg) => {
      if (msg && typeof msg === 'object' && msg.type) {
        this._onMessage(msg.type, msg.payload, msg.options)
      }
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

  send(type, payload) {
    this.worker.send(type, payload)
  }
}
