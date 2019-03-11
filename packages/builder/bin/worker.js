const HTTPFSMiddleware = require('htfs/lib/middleware')
const { startWorker, getNuxt, getBuilder, createHTTPService } = require('@nuxt/worker')

startWorker({
  name: 'builder',

  async run(opts, bridge) {
    // Create nuxt and builder instance
    const nuxt = await getNuxt({ ...opts, server: false })
    const builder = getBuilder(nuxt)

    // Dev specific
    if (opts.dev) {
      // Builder service
      await bridge.registerService('builder', createHTTPService({
        '/mfs': HTTPFSMiddleware(builder.bundleBuilder.mfs)
      }))

      // Publish builder hooks
      bridge.publishHook(nuxt, 'build:resources')
    }

    // Start build
    await builder.build()

    // Only exit after production build
    if (!opts.dev) {
      bridge.close(0)
    }
  }
})
