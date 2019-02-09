import { getNuxt, getBuilder } from '../utils/nuxt'

export default async function builder(opts) {
  try {
    const nuxt = await getNuxt({
      ...opts,
      server: false
    })
    const builder = getBuilder(nuxt)
    await builder.build()
    process.exit(0)
  } catch (e) {
    process.exit(1)
  }
}
