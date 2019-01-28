#!/usr/bin/env node

process.startTime = process.hrtime()
process.title = process.argv[2]

const { entrypoint, logError } = require('../dist/worker.js')

entrypoint().catch((error) => {
  logError(error)
  process.exit(1)
})
