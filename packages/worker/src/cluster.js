import cluster from 'cluster'
import { log } from './utils/log'
import { entrypoint } from './entrypoint'

// eslint-disable-next-line require-await
export async function forkWorker(options, num = 1) {
  if (!cluster.isMaster) {
    // --- Worker ---
    log(`Worker ${process.pid} started`)
    return entrypoint(options)
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
