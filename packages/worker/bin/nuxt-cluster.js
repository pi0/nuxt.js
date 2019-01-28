#!/usr/bin/env node

process.startTime = process.hrtime()
process.title = process.argv[2]

const { cpus } = require('os')

const { forkWorker, logError } = require('../dist/worker.js')

for (let i = 0; i < cpus().length; i++) {
  forkWorker().catch(logError)
}
