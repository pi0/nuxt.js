import consola from 'consola'
import chalk from 'chalk'
import opener from 'opener'
import { forkWorker } from '@nuxt/worker'
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

  async run(cmd) {
    const { argv } = cmd
    const nuxt = await this.startDev(cmd, argv)

    // Opens the server listeners url in the default browser
    if (argv.open) {
      const openerPromises = nuxt.server.listeners.map(listener => opener(listener.url))
      await Promise.all(openerPromises)
    }
  },

  async startDev(cmd, argv) {
    if (argv.worker) {
      return this._startDevWorker(cmd, argv)
    }

    try {
      const nuxt = await this._startDev(cmd, argv)

      return nuxt
    } catch (error) {
      consola.error(error)
    }
  },

  async _startDev(cmd, argv) {
    const config = await cmd.getNuxtConfig({ dev: true })
    const nuxt = await cmd.getNuxt(config)

    // Setup hooks
    nuxt.hook('watch:restart', payload => this.onWatchRestart(payload, { nuxt, builder, cmd, argv }))
    nuxt.hook('bundler:change', changedFileName => this.onBundlerChange(changedFileName))

    // Start listening
    await nuxt.server.listen()

    // Create builder instance
    const builder = await cmd.getBuilder(nuxt)

    // Start Build
    await builder.build()

    // Show banner after build
    showBanner(nuxt)

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

  async onWatchRestart({ event, path }, { nuxt, cmd, argv }) {
    this.logChanged({ event, path })

    await nuxt.close()

    await this.startDev(cmd, argv)
  },

  onBundlerChange(path) {
    this.logChanged({ event: 'change', path })
  },

  // ------------------------------------
  // Worker
  // ------------------------------------
  async _startDevWorker(cmd, argv) {
    // Setup hooks
    // TODO
    // nuxt.hook('watch:restart', payload => this.onWatchRestart(payload, { nuxt, builder, cmd, argv }))
    // nuxt.hook('bundler:change', changedFileName => this.onBundlerChange(changedFileName))

    const rootDir = argv._[0] || '.'
    const opts = {
      dev: true
    }

    // Start server worker
    await forkWorker('server', rootDir, opts)

    /// Start builder worker
    await forkWorker('builder', rootDir, opts)

    // Show banner after build
    // TODO
    // showBanner(nuxt)
  }
}
