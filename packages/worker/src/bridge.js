import { Server } from 'http'

export class WorkerBridge {
  constructor() {
    this._send = process.send.bind(process)
    if (!this._send) {
      throw new Error('`process.send` is unavailable! Is this process running as a child?')
    }
  }

  send(type, payload) {
    this._send({
      type,
      payload
    })
  }

  onError(error) {
    try {
      this.send('error', { message: error + '' })
    } catch (e) {
      console.error(e) // eslint-disable-line no-console
    }
  }

  exit(code = 0) {
    this.send('exit', code)
    process.exit(code)
  }
}
