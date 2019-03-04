import EventEmitter from 'events'

export class BaseBridge extends EventEmitter {
  onError(error) {
    try {
      this.send('_error', { message: error + '' })
    } catch (e) {
      console.error(e) // eslint-disable-line no-console
    }
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

  registerService(name, { address, ...opts }) {
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
