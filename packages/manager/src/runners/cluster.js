import cluster from 'cluster'
import { ProcessRunner } from './process'

export class ClusterRunner extends ProcessRunner {
  _forkProcess() {
    // Setup master setting for entrypoint
    cluster.setupMaster({
      exec: this._getNuxtWorkerBin(),
      args: [
        this.workerName,
        this.rootDir,
        JSON.stringify(this.options)
      ]
    })

    // Fork worker
    this.worker = cluster.fork()

    // Set this.process
    this.process = this.worker.process
  }
}
