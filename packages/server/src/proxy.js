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
    this.rules = {}

    // Bind middleware to self
    this.middleware = this.middleware.bind(this)
  }

  _handleProxyError(error, req, res, options) {
    const errorMsg = 'Proxy error: ' + error.toString()
    consola.error(errorMsg)
    if (res) {
      res.statusCode = 500
      res.end(errorMsg)
    }
  }

  _matchRule(url) {
    for (const prefix in this.rules) {
      if (url.indexOf(prefix) === 0) {
        return this.rules[prefix]
      }
    }
  }

  _sortRules() {
    const rules = {}

    const sortedKeys = Object.keys(this.rules).sort((a, b) => b.length - a.length)
    for (const key of sortedKeys) {
      rules[key] = this.rules[key]
    }

    this.rules = rules
  }

  register(prefix, _proxyOptions) {
    const proxyOptions = {
      prefix,
      ...this.options.proxyDefaults,
      ..._proxyOptions
    }

    this.rules[prefix] = proxyOptions
    this._sortRules()
  }

  unregister(prefix) {
    delete this.rules[prefix]
  }

  middleware(req, res, next) {
    // Try to match based on req.url
    const matchedRule = this._matchRule(req.url)

    // Skip if no matches
    if (!matchedRule) {
      return next()
    }

    // Remove prefix
    req.url = req.url.substr(matchedRule.prefix.length)

    // Proxy HTTP
    this.proxy.web(req, res, matchedRule)
  }

  _handleUpgrade(req, sock, head) {
    // Try to match based on req.url
    const matchedRule = this._matchRule(req.url)

    // Skip if no matches or no ws enabled
    if (!matchedRule || !matchedRule.ws) {
      return
    }

    // Remove prefix
    req.url = req.url.substr(matchedRule.prefix.length)

    // Proxy WebSocket
    this.proxy.ws(req, sock, head, matchedRule)
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
