import { Server } from 'http'
import EventEmitter from 'events'

export class WorkerBridge extends EventEmitter {
  constructor() {
    super()

    this._send = process.send.bind(process)
    if (!this._send) {
      throw new Error('`process.send` is unavailable! is this process running as a child?')
    }

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

  onError(error) {
    try {
      this.send('_error', { message: error + '' })
    } catch (e) {
      console.error(e) // eslint-disable-line no-console
    }
  }

  exit(code = 0) {
    this.send('_exit', code)
    process.exit(code)
  }

  subscribe(type, cb) {
    this.send('_subscribe', type)

    if (cb) {
      this.on(type, (payload) => {
        cb(payload)
      })
    }
  }

  async startService(name, requestListener) {
    // Create new server
    const server = new Server(requestListener)

    // Listen on a random port
    await new Promise((resolve, reject) => {
      server.listen(0, error => error ? reject(error) : resolve())
    })

    // Get port
    const address = server.address()

    // Announce service
    this.send('_addService', { name, address })
  }

  monitorServices(cb) {
    // Listen for _services message
    this.on('_services', services => cb(services))

    // Subscribe for _addService event
    this.subscribe('_addService', () => {
      this.send('_getServices')
    })

    // Initial discovery
    this.send('_getServices')
  }
}
