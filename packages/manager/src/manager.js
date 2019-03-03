import Table from 'cli-table'
import { ClusterRunner } from './runners/cluster'

export class Manager {
  constructor() {
    this._runners = []
    this._subscribers = {} // type => [runners]

    this._messageHandlers = {
      _subscribe: this._handleSubscribe.bind(this)
    }
  }

  showStatus() {
    const table = new Table({
      head: ['Name', 'ID', 'Status']
    })
    for (const runner of this._runners) {
      table.push([runner.workerName, runner.id, runner.status])
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
    // Check for internal message
    if (type[0] === '_') {
      const handlerFn = this._messageHandlers[type]
      if (handlerFn) {
        handlerFn(runner, payload)
      }
      return
    }

    // Send message to subscribers
    const sendTo = this._subscribers[type] || []
    for (const runner of sendTo) {
      runner.send(type, payload)
    }
  }

  _handleSubscribe(runner, payload) {
    if (!this._subscribers[payload]) {
      this._subscribers[payload] = []
    }
    this._subscribers[payload].push(runner)
  }
}

export const manager = new Manager()
