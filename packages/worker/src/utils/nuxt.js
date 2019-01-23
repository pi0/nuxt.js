export async function getNuxt(opts) {
  const { Nuxt } = require('@nuxt/core')
  const nuxt = new Nuxt(opts)
  await nuxt.ready()
  return nuxt
}

export function getBuilder(nuxt) {
  const { Builder } = require('@nuxt/builder')
  const builder = new Builder(nuxt)
  return builder
}
