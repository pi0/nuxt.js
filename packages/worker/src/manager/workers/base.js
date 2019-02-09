import { WORKER_STATUS, WORKER_STATUS_STR } from '../consts'

export class BaseWorker {
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
    return this.workerName
  }

  get status() {
    return WORKER_STATUS_STR[this.statusCode]
  }
}
