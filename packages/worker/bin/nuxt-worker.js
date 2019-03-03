#!/usr/bin/env node

process.startTime = process.hrtime()
process.name = process.argv[2]

const { startWorker } = require('../dist/worker.js')

startWorker().catch((error) => {
  console.error(error) // eslint-disable-line no-console
  process.exit(2)
})
