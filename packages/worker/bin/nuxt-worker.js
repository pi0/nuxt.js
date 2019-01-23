#!/usr/bin/env node

require('../dist/worker.js').entrypoint()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
