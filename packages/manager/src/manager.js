import Table from 'cli-table'
import debounce from 'debounce'
import consola from 'consola'
import { ClusterRunner } from './runners/cluster'

export class Manager {
  constructor() {
    this._runners = []
    this._subscribers = {} // type => [runners]

    this._messageHandlers = {
      _error: this._handleError.bind(this),
      _subscribe: this._handleSubscribe.bind(this),
      _addService: this._handleAddService.bind(this),
      _getServices: this._handleGetServices.bind(this)
    }

    this.showStatus = debounce(this._showStatus.bind(this), 1000)
  }

  _showStatus() {
    const table = new Table({ head: ['Name', 'ID', 'Status', 'Services'] })
    for (const runner of this._runners) {
      const servicesStr = runner.services
        .map(service => `${service.name} (${service.address.port})`).join(', ')

      table.push([runner.workerName, runner.id, runner.status, servicesStr])
    }
    console.log(table.toString()) // eslint-disable-line no-console
  }

  async forkWorker(workerName, rootDir, options) {
    const runner = new ClusterRunner(workerName, rootDir, options)
    this._registerRunner(runner)
    await runner.start()
  }

  _registerRunner(runner) {
    this._runners.push(runner)

    runner.on('update', () => {
      this.showStatus()
    })

    runner.on('message', (type, payload) => {
      this._handleMessage(runner, type, payload)
    })
  }

  _handleMessage(runner, type, payload) {
    // Check for internal handlers
    if (type[0] === '_') {
      const handlerFn = this._messageHandlers[type]
      if (handlerFn) {
        handlerFn(runner, payload)
      }
    }

    // Send message to subscribers
    const sendTo = this._subscribers[type] || []
    for (const runner of sendTo) {
      runner.send(type, payload)
    }
  }

  _handleError(runner, payload) {
    consola.error(`Error from ${runner.workerName} worker:`, payload.message)
  }

  _handleSubscribe(runner, payload) {
    if (!this._subscribers[payload]) {
      this._subscribers[payload] = []
    }
    this._subscribers[payload].push(runner)
  }

  _handleAddService(runner, payload) {
    runner._addService(payload)
  }

  _handleGetServices(runner) {
    // Group services by name
    const services = {}

    for (const _runner of this._runners) {
      if (_runner === runner) {
        continue
      }
      for (const service of _runner.services) {
        if (!services[service.name]) {
          services[service.name] = []
        }
        services[service.name].push(service.address)
      }
    }

    // Send result back to the runner
    runner.send('_services', services)
  }
}

export const manager = new Manager()
