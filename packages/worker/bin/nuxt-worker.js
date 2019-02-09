#!/usr/bin/env node

process.startTime = process.hrtime()
process.title = process.argv[2]

const { startWorker, logError } = require('../dist/worker.js')

startWorker().catch((error) => {
  logError(error)
  process.exit(1)
})
