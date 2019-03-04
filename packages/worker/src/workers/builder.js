import { getNuxt, getBuilder } from '../utils/nuxt'
import { createHTTPService, createWSService } from '../utils/service'

export default async function builder(opts, bridge) {
  // Create nuxt and builder instance
  const nuxt = await getNuxt({ ...opts, server: false })
  const builder = getBuilder(nuxt)

  // Testing httpService
  // const httpService = await createHTTPService((req, res) => {
  //   res.end('HTTP Works!')
  // })
  // await bridge.registerService('builder', httpService)

  // Testing wsService
  const wsService = await createWSService((ws, req) => {
    ws.on('message', (message) => {
      ws.send(message)
    })
    ws.send('WS Works!')
  })
  await bridge.registerService('builder', wsService)

  // Start build
  await builder.build()

  // Only exit after production build
  if (!opts.dev) {
    bridge.exit()
  }
}
