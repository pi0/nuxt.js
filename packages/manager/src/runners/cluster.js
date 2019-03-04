import cluster from 'cluster'
import { WORKER_STATUS } from '../consts'
import { BaseRunner } from './base'

export class ClusterRunner extends BaseRunner {
  constructor(workerName, rootDir = '.', options = {}) {
    super(workerName, rootDir, options)
  }

  get id() {
    return this.worker ? this.worker.process.pid : -1
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
    this.status = WORKER_STATUS.STARTED
  }

  send(type, payload) {
    if (!this.worker) {
      return
    }
    this.worker.send({
      type,
      payload
    })
  }

  _listenOnMessage() {
    this.worker.on('message', (msg) => {
      if (msg && msg.type) {
        this.emit('message', msg.type, msg.payload)
      }
    })
  }

  _listenOnExit() {
    this.worker.on('exit', (code, signal) => {
      // Update status
      this.status = WORKER_STATUS.CLOSED

      // Emit close event
      this.emit('close', code, signal)
    })
  }
}
