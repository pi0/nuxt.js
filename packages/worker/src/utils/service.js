import { Server } from 'http'

export async function createHTTPService(requestListener) {
  // Create new server
  const server = new Server(requestListener)

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
