import consola from 'consola'
import { createProxy } from 'http-proxy'

export default class Proxy {
  constructor(options) {
    // Options
    this.options = {
      proxyDefaults: {
        changeOrigin: true
      },
      ...options
    }

    // Create proxy
    this.proxy = createProxy()
    this.proxy.on('error', this._handleProxyError.bind(this))

    // Dynamic proxy list (prefix => opts)
    this.proxies = {}

    // Bind middleware to self
    this.middleware = this.middleware.bind(this)
  }

  _handleProxyError(error, req, res, options) {
    const errorMsg = 'Proxy error: ' + error.toString()
    consola.error(errorMsg)
    res.statusCode = 500
    res.end(errorMsg)
  }

  _matchProxy(url) {
    for (const prefix in this.proxies) {
      if (url.indexOf(prefix) === 0) {
        return this.proxies[prefix]
      }
    }
  }

  register(prefix, _proxyOptions) {
    const proxyOptions = {
      ...this.options.proxyDefaults,
      ..._proxyOptions
    }

    this.proxies[prefix] = proxyOptions
  }

  unregister(prefix) {
    delete this.proxies[prefix]
  }

  middleware(req, res, next) {
    // Try to match based on req.url
    const matchedProxy = this._matchProxy(req.url)

    // Skip if no matches
    if (!matchedProxy) {
      return next()
    }

    // Proxy HTTP
    this.proxy.web(req, res, matchedProxy)
  }

  _handleUpgrade(req, sock, head) {
    // Try to match based on req.url
    const matchedProxy = this._matchPrefix(req.url)

    // Skip if no matches or no ws enabled
    if (!matchedProxy || !matchedProxy.ws) {
      return
    }

    // Proxy WebSocket
    this.proxy.ws(req, sock, head, matchedProxy)
  }

  hookUpgrade(server) {
    server.on('upgrade', (req, socket, head) => {
      this._handleUpgrade(req, socket, head)
    })
  }

  close() {
    if (this.__closed) {
      return
    }
    this.__closed = true

    this.proxy.close()
  }
}
