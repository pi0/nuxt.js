import EventEmitter from 'events'
import { WORKER_STATUS, WORKER_STATUS_STR } from '../consts'

export class BaseWorker extends EventEmitter {
  constructor(workerName, rootDir = '.', options = {}) {
    super()

    if (typeof options === 'string' && options[0] === '{') {
      options = JSON.parse(options)
    }

    this.workerName = workerName
    this.rootDir = rootDir
    this.options = options

    this._statusCode = WORKER_STATUS.CREATED
  }

  get id() {
    return -1
  }

  set statusCode(_statusCode) {
    this._statusCode = _statusCode
    this.emit('status', _statusCode)
  }

  get status() {
    return WORKER_STATUS_STR[this._statusCode]
  }

  emit(event, ...args) {
    super.emit('event', event, ...args)
    super.emit(event, ...args)
  }
}
