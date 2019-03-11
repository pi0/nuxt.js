const HTTPFSAClient = require('htfs/lib/client')
const { startWorker, getNuxt } = require('@nuxt/worker')

startWorker({
  name: 'server',

  async run(opts, bridge) {
    const nuxt = await getNuxt(opts)

    // Monitor service registrations
    bridge.monitorServices((services) => {
      // Proxy all services under _services
      for (const serviceName in services) {
        const service0 = services[serviceName][0]
        nuxt.callHook('server:registerProxy', '/_services/' + serviceName, {
          target: service0.url,
          ws: service0.ws
        })
      }

      // Connect builder service
      if (opts.dev && services.builder) {
        const endpoint = services.builder[0].url + '/mfs'
        const httpfs = new HTTPFSAClient({ endpoint })
        bridge.subscribeHook(nuxt, 'build:resources', () => [httpfs])
      }
    })

    await nuxt.server.listen()
  }
})
