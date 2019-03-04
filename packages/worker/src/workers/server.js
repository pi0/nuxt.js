import { getNuxt } from '../utils/nuxt'
import { createHTTPService } from '../utils/service'

export default async function server(opts, bridge) {
  const nuxt = await getNuxt(opts)

  // Testing httpService
  const httpService = await createHTTPService((req, res) => {
    res.end('HTTP Works!')
  })
  await bridge.registerService('server', httpService)

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
