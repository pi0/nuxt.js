#!/usr/bin/env node

process.startTime = process.hrtime()
process.name = process.argv[2]

const { startWorker } = require('../dist/worker.js')

startWorker().catch((error) => {
  require('consola').error(error)
  process.exit(1)
})
