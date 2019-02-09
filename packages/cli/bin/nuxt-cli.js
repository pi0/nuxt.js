#!/usr/bin/env node

process.name = 'cli'

require('../dist/cli.js').run()
  .catch((error) => {
    require('consola').fatal(error)
    require('exit')(2)
  })
