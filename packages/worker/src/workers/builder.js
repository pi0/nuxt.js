import { getNuxt, getBuilder } from '../utils/nuxt'
import { createHTTPService } from '../utils/service'

export default async function builder(opts, bridge) {
  const nuxt = await getNuxt({ ...opts, server: false })
  const builder = getBuilder(nuxt)

  const test = await createHTTPService((req, res) => {
    res.end('Works!')
  })

  await bridge.registerService('builder', test)

  await builder.build()

  if (!opts.dev) {
    bridge.exit()
  }
}
