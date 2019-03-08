import EventEmitter from 'events'

export class BaseBridge extends EventEmitter {
  onError(error) {
    this._logError(error)
    try {
      this.send('_error', { message: error + '' })
    } catch (error) {
      this._logError(error)
    }
  }

  _logError(error) {
    // eslint-disable-next-line no-console
    console.error(error)
  }

  close(code = 0) {
    this.send('_close', code)
  }

  subscribe(type, cb) {
    this.send('_subscribe', type)

    if (cb) {
      this.on(type, (payload) => {
        cb(payload)
      })
    }
  }

  async registerService(name, arg1) {
    if (typeof arg1.then === 'function') {
      arg1 = await arg1
    }
    const { address, ...opts } = arg1

    this.send('_registerService', {
      name,
      address,
      url: `${opts.ws ? 'ws' : 'http'}://localhost:${address.port}`,
      ...opts
    })
  }

  monitorServices(cb) {
    // Listen for _services message
    this.on('_services', services => cb(services))

    // Subscribe for _registerService event
    this.subscribe('_registerService', () => {
      this.send('_getServices')
    })

    // Initial discovery
    this.send('_getServices')
  }
}
