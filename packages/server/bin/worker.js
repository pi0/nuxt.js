const { startWorker, getNuxt } = require('@nuxt/worker')

startWorker({
  name: 'server',

  async run(opts, bridge) {
    const nuxt = await getNuxt(opts)

    bridge.monitorServices((services) => {
      for (const serviceName in services) {
        const service0 = services[serviceName][0]
        nuxt.callHook('server:registerProxy', '/_services/' + serviceName, {
          target: service0.url,
          ws: service0.ws
        })
      }
    })

    await nuxt.server.listen()
  }
})
