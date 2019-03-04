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

    this.services = []
  }

  set status(_statusCode) {
    this._statusCode = WORKER_STATUS[_statusCode] || _statusCode
    this.emit('update')
  }

  get status() {
    return WORKER_STATUS_STR[this._statusCode]
  }

  _registerService(service) {
    this.services.push(service)
    this.emit('update')
  }

  // -- Abstracts --
  get id() {}
  start() {}
  send() {}
}
