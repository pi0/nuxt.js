import { common, server } from '../options'
import { showBanner } from '../utils'

export default {
  name: 'start',
  description: 'Start the application in production mode (the application should be compiled with `nuxt build` first)',
  usage: 'start <dir>',
  options: {
    ...common,
    ...server
  },

  run() {
    // Worker Mode
    if (this.cmd.argv.worker) {
      return this.startWorker()
    }

    return this.start()
  },

  async start() {
    const config = await this.cmd.getNuxtConfig({ dev: false, _start: true })
    const nuxt = await this.cmd.getNuxt(config)

    // Listen and show ready banner
    await nuxt.server.listen()
    showBanner(nuxt)
  },

  async startWorker() {
    throw new Error('TODO')
  }
}
