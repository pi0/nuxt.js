import { BaseBridge } from './base'

export class ProcessBridge extends BaseBridge {
  constructor() {
    super()

    if (!process.send) {
      throw new Error('`process.send` is unavailable! is this process running as a child?')
    }
    this._send = process.send.bind(process)

    process.on('message', (message) => {
      if (message && message.type) {
        this.emit(message.type, message.payload)
      }
    })
  }

  send(type, payload) {
    this._send({
      type,
      payload
    })
  }

  close(code = 0) {
    super.close(code)
    process.exit(code)
  }
}
