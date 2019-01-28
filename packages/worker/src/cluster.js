import cluster from 'cluster'
import { log } from './utils/log'

// Listen to worker exit event
cluster.on('exit', (worker, code, signal) => {
  log(`Worker ${worker.process.pid} died. ${signal} (${code})`)
})

// eslint-disable-next-line require-await
export async function forkWorker(args = process.argv.slice(2)) {
  // Setup master setting for entrypoint
  cluster.setupMaster({
    exec: require.resolve('@nuxt/worker/bin/nuxt-worker'),
    args
  })

  // Fork worker
  cluster.fork()
}
