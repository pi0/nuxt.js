export class WorkerBridge {
  constructor() {
    this._send = process.send.bind(process)
    if (!this._send) {
      throw new Error('`process.send` is unavailable! Is this process running as a child?')
    }
  }

  send(type, payload, options = {}) {
    this._send({
      type,
      payload,
      options
    })
  }

  boradcast(type, payload) {
    this.send(type, payload, { boradcast: true })
  }

  setStatus(statusName) {
    this.send('status', statusName.toUpperCase())
  }

  setRunning() {
    this.setStatus('RUNNING')
  }

  onError(error) {
    try {
      this.send('error', { message: error + '' })
    } catch (e) {
      console.error(e) // eslint-disable-line no-console
    }
  }

  exit(code = 0) {
    this.send('exiting', code)
    process.exit(code)
  }
}
