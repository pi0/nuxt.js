import EventEmitter from 'events'
import { WORKER_STATUS, WORKER_STATUS_STR } from '../consts'

export class BaseRunner extends EventEmitter {
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

  set status(_statusCode) {
    this._statusCode = WORKER_STATUS[_statusCode] || _statusCode
    this.emit('update', 'status', this._statusCode)
  }

  get status() {
    return WORKER_STATUS_STR[this._statusCode]
  }

  // -- Abstracts --
  get id() {}
  start() {}
  send() {}
}
