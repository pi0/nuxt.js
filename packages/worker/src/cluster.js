import cluster from 'cluster'
import { log } from './utils/log'
import { entrypoint } from './entrypoint'

// eslint-disable-next-line require-await
export async function forkWorker(num = 1, ...args) {
  if (!cluster.isMaster) {
    // --- Worker ---
    log(`Worker ${process.pid} started`)
    return entrypoint(args.length && args)
  }

  // --- Master ---
  // Fork workers.
  for (let i = 0; i < num; i++) {
    cluster.fork()
  }

  // Listen to worker exit event
  cluster.on('exit', (worker, code, signal) => {
    log(`Worker ${worker.process.pid} died. ${signal} (${code})`)
  })
}
