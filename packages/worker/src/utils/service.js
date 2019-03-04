import http from 'http'
import ws from 'ws'

export async function createHTTPService(requestListener) {
  // Create new server
  const server = new http.Server(requestListener)

  // Listen on a random port
  await new Promise((resolve, reject) => {
    server.listen(0, error => error ? reject(error) : resolve())
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
