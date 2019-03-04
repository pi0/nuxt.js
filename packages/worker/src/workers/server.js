import { getNuxt } from '../utils/nuxt'

export default async function server(opts, bridge) {
  const nuxt = await getNuxt(opts)

  bridge.monitorServices((services) => {
    console.log('Services: ', services)
  })

  await nuxt.server.listen()
}
