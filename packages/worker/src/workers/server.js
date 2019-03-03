import { getNuxt } from '../utils/nuxt'

export default async function server(opts, bridge) {
  const nuxt = await getNuxt(opts)
  await nuxt.server.listen()
}
