#!/usr/bin/env node

const { cpus } = require('os')
const consola = require('consola')
const { manager } = require('../dist/manager.js')

const [workerName, rootDir, options] = process.argv.slice(2)

for (let i = 0; i < cpus().length; i++) {
  manager.forkWorker(workerName, rootDir, options).catch((error) => {
    consola.error(error)
    process.exit(1)
  })
}

manager.showStatus()
