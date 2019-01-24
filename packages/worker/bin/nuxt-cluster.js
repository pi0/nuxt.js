#!/usr/bin/env node

const { cpus } = require('os')

process.startTime = process.hrtime()

const { forkWorker, logError } = require('../dist/worker.js')

forkWorker(cpus().length).catch((error) => {
  logError(error)
  process.exit(1)
})
