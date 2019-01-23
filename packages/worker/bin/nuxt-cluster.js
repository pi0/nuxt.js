#!/usr/bin/env node

process.startTime = process.hrtime()

const { startCluster, logError } = require('../dist/worker.js')

startCluster().catch((error) => {
  logError(error)
  process.exit(1)
})
