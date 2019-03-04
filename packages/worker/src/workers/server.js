import { getNuxt } from '../utils/nuxt'

export default async function server(opts, bridge) {
  const nuxt = await getNuxt(opts)

  bridge.monitorServices((services) => {
    for (const serviceName in services) {
      const service0 = services[serviceName][0]
      nuxt.callHook('server:registerProxy', '/_services/' + serviceName, {
        target: service0.url
      })
    }
  })

  await nuxt.server.listen()
}
