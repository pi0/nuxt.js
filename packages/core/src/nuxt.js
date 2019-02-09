
import isPlainObject from 'lodash/isPlainObject'
import consola from 'consola'

import { defineAlias } from '@nuxt/utils'
import { getNuxtConfig } from '@nuxt/config'
import { Server } from '@nuxt/server'

import { version } from '../package.json'

import ModuleContainer from './module'
import Hookable from './hookable'
import Resolver from './resolver'

export default class Nuxt extends Hookable {
  constructor(_options = {}) {
    super()

    // Assign options and apply defaults
    this.options = getNuxtConfig(_options)

    // Deprecated hooks
    this._deprecatedHooks = {
      'render:context': 'render:routeContext',
      'render:routeContext': 'vue-renderer:afterRender',
      'showReady': 'webpack:done' // Workaround to deprecate showReady
    }

    // Create resolver
    this.resolver = new Resolver(this)
    defineAlias(this, this.resolver, ['resolveAlias', 'resolvePath'])

    // Create moduleContainer
    this.moduleContainer = new ModuleContainer(this)

    // Create server
    if (this.options.server) {
      this.server = new Server(this)
      defineAlias(this, this.server, ['renderRoute', 'renderAndGetWindow', 'listen'])
      this.renderer = this.server
      this.render = this.server.app
    }

    // Legacy aliases
    this.showReady = () => { this.callHook('webpack:done') }

    // Wait for Nuxt to be ready
    this.initialized = false
    this._ready = this.ready().catch((err) => {
      consola.fatal(err)
    })
  }

  static get version() {
    return (global.__NUXT && global.__NUXT.version) || `v${version}`
  }

  async ready() {
    if (this._ready) {
      return this._ready
    }

    // Add hooks
    if (isPlainObject(this.options.hooks)) {
      this.addHooks(this.options.hooks)
    } else if (typeof this.options.hooks === 'function') {
      this.options.hooks(this.hook)
    }

    // Await for modules
    await this.moduleContainer.ready()

    // Await for server to be ready
    await this.server.ready()

    this.initialized = true

    // Call ready hook
    await this.callHook('ready', this)

    return this
  }

  async close(callback) {
    await this.callHook('close', this)

    if (typeof callback === 'function') {
      await callback()
    }

    this.clearHooks()
  }
}
