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

    this.statusCode = WORKER_STATUS.READY
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
    this.statusCode = WORKER_STATUS.FORKED
  }

  _listenOnExit() {
    this.worker.on('exit', (code, signal) => {
      // Update status
      this.statusCode = WORKER_STATUS.STOPPED

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
  EXITED: 0,
  READY: 1,
  FORKED: 2,
  ONLINE: 3
}

const WORKER_STATUS_STR = {
  0: 'exited',
  1: 'ready',
  2: 'forked',
  3: 'online'
}
