import cluster from 'cluster'
import { debug } from '../utils/log'

export class Worker {
  constructor(workerName, rootDir = '.', options = {}) {
    if (typeof options === 'string' && options[0] === '{') {
      options = JSON.parse(options)
    }

    this.workerName = workerName
    this.rootDir = rootDir
    this.options = options

    this.statusCode = WORKER_STATUS.CREATED
  }

  get id() {
    return this.workerName + ':' + (this.worker ? this.worker.id : '?')
  }

  get status() {
    return WORKER_STATUS_STR[this.statusCode]
  }

  fork() {
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
        debug(`Worker ${this.id} was killed by signal ${signal}`)
      } else if (code !== 0) {
        debug(`Worker ${this.id} exited with error code: ${code}`)
      } else {
        debug(`Worker ${this.id} finished successfully`)
      }
    })
  }
}

const WORKER_STATUS = {
  CREATED: 0,
  RUNNING: 1,
  EXITED: 2
}

const WORKER_STATUS_STR = {
  [WORKER_STATUS.CREATED]: 'created',
  [WORKER_STATUS.RUNNING]: 'running',
  [WORKER_STATUS.EXITED]: 'exit'
}
