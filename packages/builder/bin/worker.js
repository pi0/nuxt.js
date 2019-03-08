const { startWorker, getNuxt, getBuilder, createHTTPService } = require('@nuxt/worker')

startWorker({
  name: 'builder',

  async run(opts, bridge) {
    // Create nuxt and builder instance
    const nuxt = await getNuxt({ ...opts, server: false })
    const builder = getBuilder(nuxt)

    // Builder service
    await bridge.registerService('builder', createHTTPService({
      '/mfs': serveMFS(builder.bundleBuilder.mfs)
    }))

    // Start build
    await builder.build()

    // Only exit after production build
    if (!opts.dev) {
      bridge.close(0)
    }
  }
})

function serveMFS(mfs) {
  return (req, res) => {
    // Resource path is url relative to /mfs
    const resourcePath = req.url

    // Stat path
    let stat
    try {
      stat = mfs.statSync(resourcePath)
    } catch (e) {
      res.statusCode = 404
      return res.end('No such a file or directory: ' + resourcePath)
    }

    // Directory listing
    if (stat.isDirectory()) {
      return res.end(`
        <html>
          <body>
          <h1>Index of ${resourcePath}</h1>
          <ul>
            ${mfs.readdirSync(resourcePath).map(link => `<li><a href="${link}/">${link}</a></li>`).join('\n')}
          </ul>
          </body>
        </html>
      `)
    }

    // Serve file
    res.end(mfs.readFileSync(resourcePath))
  }
}
