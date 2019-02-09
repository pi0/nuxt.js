#!/usr/bin/env node

const [workerName, rootDir, options] = process.argv.slice(2)

process.startTime = process.hrtime()
process.name = workerName

const { cpus } = require('os')

const { manager, logError } = require('../dist/worker.js')

for (let i = 0; i < cpus().length; i++) {
  manager.forkWorker(workerName, rootDir, options).catch(logError)
}
