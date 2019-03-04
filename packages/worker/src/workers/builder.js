import { getNuxt, getBuilder } from '../utils/nuxt'

export default async function builder(opts, bridge) {
  const nuxt = await getNuxt({ ...opts, server: false })
  const builder = getBuilder(nuxt)

  await bridge.startService('builder', (req, res) => {
    res.end('Works!')
  })

  await builder.build()

  if (!opts.dev) {
    bridge.exit()
  }
}
