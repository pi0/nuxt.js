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

  get id() {
    return -1
  }

  set statusCode(_statusCode) {
    this._statusCode = _statusCode
    this._emitEvent('status', {
      code: _statusCode,
      name: this.status
    })
  }

  get status() {
    return WORKER_STATUS_STR[this._statusCode]
  }

  send() {}

  _emitEvent(event, payload) {
    this.emit('event', event, payload)
  }

  _onMessage(type, payload, options) {
    // Handle known types
    switch (type) {
      case 'status':
        const newStatus = WORKER_STATUS[payload]
        if (newStatus) {
          this.statusCode = newStatus
        }
        break
    }

    // Emit to parent
    this.emit('message', type, payload, options)
  }
}
