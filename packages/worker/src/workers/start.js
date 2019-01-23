// This is a dummy worker for testing
export default async (opts) => {
  const { Nuxt } = require('@nuxt/core')

  opts._start = true
  opts.dev = false

  const nuxt = new Nuxt(opts)
  await nuxt.ready()

  await nuxt.server.listen()
}
