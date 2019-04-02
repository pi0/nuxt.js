import consola from 'consola'
import chalk from 'chalk'
import opener from 'opener'
import { common, server } from '../options'
import { showBanner, eventsMapping, formatPath } from '../utils'

export default {
  name: 'dev',
  description: 'Start the application in development mode (e.g. hot-code reloading, error reporting)',
  usage: 'dev <dir>',
  options: {
    ...common,
    ...server,
    open: {
      alias: 'o',
      type: 'boolean',
      description: 'Opens the server listeners url in the default browser'
    }
  },

  run() {
    if (this.cmd.argv.worker) {
      return this.devWorker()
    }
    return this.dev()
  },

  async dev() {
    try {
      const nuxt = await this._dev()
      return nuxt
    } catch (error) {
      consola.error(error)
    }
  },

  async _dev() {
    const config = await this.cmd.getNuxtConfig({ dev: true, _build: true })
    const nuxt = await this.cmd.getNuxt(config)

    // Setup hooks
    nuxt.hook('watch:restart', payload => this.onWatchRestart(payload, { nuxt, builder }))
    nuxt.hook('bundler:change', changedFileName => this.onBundlerChange(changedFileName))

    // Wait for nuxt to be ready
    await nuxt.ready()

    // Start listening
    await nuxt.server.listen()

    // Show banner when listening
    showBanner(nuxt)

    // Opens the server listeners url in the default browser (only once)
    if (this.cmd.argv.open) {
      this.cmd.argv.open = false
      const openerPromises = nuxt.server.listeners.map(listener => opener(listener.url))
      await Promise.all(openerPromises)
    }

    // Create builder instance
    const builder = await this.cmd.getBuilder(nuxt)

    // Start Build
    await builder.build()

    // Return instance
    return nuxt
  },

  logChanged({ event, path }) {
    const { icon, color, action } = eventsMapping[event] || eventsMapping.change

    consola.log({
      type: event,
      icon: chalk[color].bold(icon),
      message: `${action} ${chalk.cyan(formatPath(path))}`
    })
  },

  async onWatchRestart({ event, path }, { nuxt }) {
    this.logChanged({ event, path })

    await nuxt.close()

    await this.dev()
  },

  onBundlerChange(path) {
    this.logChanged({ event: 'change', path })
  },

  async devWorker() {
    // Start server worker
    await this.cmd.forkProcess('@nuxt/server' + '/bin/worker', { dev: true })

    // Start builder worker
    await this.cmd.forkProcess('@nuxt/builder' + '/bin/worker', { dev: true })
  }
}
