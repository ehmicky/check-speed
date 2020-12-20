import { createServer } from 'http'
import { promisify } from 'util'

import { v4 as uuidv4 } from 'uuid'

import { PluginError } from '../error/main.js'

// Start a local HTTP server to communicate with runner processes.
// We use HTTP instead of other IPC mechanisms:
//  - Signals and named pipes are not easy to make cross-platform
//  - Using shared memory (like files) requires runners to poll, which is slower
//    and makes them compute for CPU and I/O
// We use HTTP instead of other protocols:
//  - Handle both request/response exchange (unlike TCP)
//  - Stateless (unlike Websocket), making it easier to implement and avoiding
//    any cleanup issues
//  - Automatically separate different requests (unlike TCP)
//  - Well-known protocol, easy to implement for any runner, notably in browsers
//  - The performance is not the best, but it pretty ok when using a local
//    server. No TCP re-connection performance issues thanks to
//    `keepAliveTimeout`
// We use the default `requestTimeout` since we are using long polling.
// Keeping the default `headersTimeout` (1 minute) is fine though.
export const startServer = async function (duration) {
  const server = createServer()
  // eslint-disable-next-line fp/no-mutation
  server.keepAliveTimeout = Math.ceil(duration / NANOSECS_TO_MILLISECS)
  await promisify(server.listen.bind(server))(HTTP_SERVER_OPTS)
  const { address, port } = server.address()
  const origin = `http://${address}:${port}`
  return { server, origin }
}

const NANOSECS_TO_MILLISECS = 1e6
const HTTP_SERVER_OPTS = { host: 'localhost', port: 0 }

// Stop the HTTP server
export const stopServer = async function (server) {
  await promisify(server.close.bind(server))()
}

// Each combination gets its own unique `id`
export const createCombinationId = function () {
  return uuidv4()
}

// Each combination gets a different endpoint using its `id`
export const getServerUrl = function (origin, id) {
  return `${origin}/rpc/${id}`
}

// When a request is made, we find the matching combination
export const findCombinationByUrl = function (req, combinations) {
  const tokens = SERVER_URL_REGEXP.exec(req.url)

  if (tokens === null) {
    throw new PluginError(`Invalid URL: ${req.url}`)
  }

  const combination = combinations.find(({ id }) => id === tokens[1])

  if (combination === undefined) {
    throw new PluginError(`Invalid ID in URL: ${req.url}`)
  }

  return combination
}

const SERVER_URL_REGEXP = /^\/rpc\/([\da-f-]+)$/iu
