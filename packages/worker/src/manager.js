import cluster from 'cluster'
import { log } from './utils/log'

class Manager {
  constructor() {
    this.listenOnExit()
  }

  listenOnExit() {
    cluster.on('exit', (worker, code, signal) => {
      if (code === 0) {
        log(`Worker ${worker.process.pid} finished successfully.`)
      } else {
        log(`Worker ${worker.process.pid} ended with error code ${code}.`)
      }
    })
  }

  forkWorker(...args) {
    // Proxy args by default
    if (!args.length) {
      args = process.argv.slice(2)
    }

    // Setup master setting for entrypoint
    cluster.setupMaster({
      exec: require.resolve('@nuxt/worker/bin/nuxt-worker'),
      args: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg)
    })

    // Fork worker
    cluster.fork()
  }
}

export const manager = new Manager()
