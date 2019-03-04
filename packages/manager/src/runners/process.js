import { fork } from 'child_process'
import { WORKER_STATUS } from '../consts'
import { BaseRunner } from './base'

export class ProcessRunner extends BaseRunner {
  constructor(workerName, rootDir = '.', options = {}) {
    super(workerName, rootDir, options)
  }

  get id() {
    return this.process ? this.process.pid : -1
  }

  start() {
    // Fork process
    this._forkProcess()

    // Setup listeners
    this._listenOnExit()
    this._listenOnMessage()

    // Update status
    this.status = WORKER_STATUS.STARTED
  }

  send(type, payload) {
    if (!this.process) {
      return
    }
    this.process.send({
      type,
      payload
    })
  }

  _forkProcess() {
    this.process = fork(
      this._getNuxtWorkerBin(),
      [
        this.workerName,
        this.rootDir,
        JSON.stringify(this.options)
      ], {
        stdout: process.stdout,
        stderr: process.stderr
      }
    )
  }

  _getNuxtWorkerBin() {
    return require.resolve('@nuxt/worker/bin/nuxt-worker')
  }

  _listenOnMessage() {
    this.process.on('message', (msg) => {
      if (msg && msg.type) {
        this.emit('message', msg.type, msg.payload)
      }
    })
  }

  _listenOnExit() {
    this.process.on('exit', (code) => {
      // Unref
      delete this.process

      // Update status
      this.status = WORKER_STATUS.CLOSED

      // Emit close event
      this.emit('close', code)
    })
  }
}
