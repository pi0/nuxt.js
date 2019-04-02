import { run } from 'tslint/lib/runner'
import { common, locking } from '../options'
import { createLock } from '../utils'

export default {
  name: 'build',
  description: 'Compiles the application for production deployment',
  usage: 'build <dir>',
  options: {
    ...common,
    ...locking,
    analyze: {
      alias: 'a',
      type: 'boolean',
      description: 'Launch webpack-bundle-analyzer to optimize your bundles',
      prepare(cmd, options, argv) {
        // Analyze option
        options.build = options.build || {}
        if (argv.analyze && typeof options.build.analyze !== 'object') {
          options.build.analyze = true
        }
      }
    },
    devtools: {
      type: 'boolean',
      default: false,
      description: 'Enable Vue devtools',
      prepare(cmd, options, argv) {
        options.vue = options.vue || {}
        options.vue.config = options.vue.config || {}
        if (argv.devtools) {
          options.vue.config.devtools = true
        }
      }
    },
    generate: {
      type: 'boolean',
      default: true,
      description: 'Don\'t generate static version for SPA mode (useful for nuxt start)'
    },
    quiet: {
      alias: 'q',
      type: 'boolean',
      description: 'Disable output except for errors',
      prepare(cmd, options, argv) {
        // Silence output when using --quiet
        options.build = options.build || {}
        if (argv.quiet) {
          options.build.quiet = !!argv.quiet
        }
      }
    },
    standalone: {
      type: 'boolean',
      default: false,
      description: 'Bundle all server dependencies (useful for nuxt-start)',
      prepare(cmd, options, argv) {
        if (argv.standalone) {
          options.build.standalone = true
        }
      }
    }
  },

  run() {
    if (this.cmd.argv.worker) {
      return this.buildWorker()
    }
    return this.build()
  },

  async build() {
    const config = await this.cmd.getNuxtConfig({ dev: false, _build: true })
    const nuxt = await this.cmd.getNuxt(config)

    if (this.cmd.argv.lock) {
      await this.cmd.setLock(await createLock({
        id: 'build',
        dir: nuxt.options.buildDir,
        root: config.rootDir
      }))
    }

    if (nuxt.options.mode !== 'spa' || this.cmd.argv.generate === false) {
      // Build only
      const builder = await this.cmd.getBuilder(nuxt)
      await builder.build()
      return
    }

    // Build + Generate for static deployment
    const generator = await this.cmd.getGenerator(nuxt)
    await generator.generate({ build: true })
  },

  async buildWorker() {
    // Start builder worker
    await this.cmd.forkProcess('@nuxt/builder' + '/bin/worker', { dev: false })
  }
}
