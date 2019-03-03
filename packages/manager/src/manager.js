import Table from 'cli-table'
import { ClusterRunner } from './runners/cluster'

export class Manager {
  constructor() {
    this._runners = []
    this._subscribers = {} // type => [runners]
  }

  showStatus() {
    const table = new Table({
      head: ['Name', 'ID', 'Status']
    })
    for (const runner of this.runners) {
      table.push([runner.workerName, runner.id, runner.status])
    }
    console.log(table.toString()) // eslint-disable-line no-console
  }

  registerRunner(runner) {
    this._runners.push(runner)

    runner.on('event', (event, payload) => {
      this._handleEvent(runner, event, payload)
    })

    runner.on('message', (type, payload, options) => {
      this._handleMessage(runner, type, payload, options)
    })
  }

  _handleEvent(runner, event, payload) {
    let message

    switch (event) {
      case 'status':
        message = `Status: ${payload.name}`
        break
    }

    // eslint-disable-next-line no-console
    console.log(`[${runner.workerName}] [${runner.id}]`, message)
  }

  _handleMessage(runner, type, payload, options) {
    let sendTo

    if (options.broadcast) {
      sendTo = this._runners.filter(_runner => _runner !== runner)
    } else {
      sendTo = this._subscribers[type] || []
    }

    for (const runner of sendTo) {
      runner.send(type, payload, options)
    }
  }

  async forkWorker(workerName, rootDir, options) {
    const runner = new ClusterRunner(workerName, rootDir, options)
    this.registerRunner(runner)
    await runner.start()
  }

  subscribe(type, runner) {
    if (!this._subscribers[type]) {
      this._subscribers[type] = []
    }
    this._subscribers[type].push(runner)
  }
}

export const manager = new Manager()
