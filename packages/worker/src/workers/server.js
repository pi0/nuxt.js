import { getNuxt } from '../utils/nuxt'

export default async function server(opts) {
  const nuxt = await getNuxt(opts)
  await nuxt.server.listen()
}
