import connect from 'connect'
import ws from 'ws'

export async function createHTTPService(routes = {}) {
  // Create new server
  const app = connect()

  // Register routes
  const sortedPaths = Object.keys(routes).sort((a, b) => b.length - a.length)
  for (const path of sortedPaths) {
    app.use(path, routes[path])
  }

  // Listen on a random port
  const server = await new Promise((resolve, reject) => {
    const server = app.listen(0, error => error ? reject(error) : resolve(server))
  })

  // Get port
  const address = server.address()

  return {
    address
  }
}

export async function createWSService(connectionListener, options) {
  // Create new server and listen on random port
  const wss = await new Promise((resolve, reject) => {
    const wss = new ws.Server({ port: 0, ...options }, error => error ? reject(error) : resolve(wss))
  })

  // Connection listener
  wss.on('connection', connectionListener)

  // Get port
  const address = wss.address()

  return {
    address,
    ws: true
  }
}
