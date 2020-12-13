import { promisify } from 'util'

import getStream from 'get-stream'

import { PluginError, UserError } from '../../error/main.js'

import { getSampleStart, addSampleDuration } from './duration.js'
import { getInput } from './input.js'
import { waitForStart, waitForOutput } from './orchestrator.js'
import { handleOutput } from './output.js'

const pSetTimeout = promisify(setTimeout)

// Measure a single combination, until there is no `duration` left
export const measureCombination = async function ({
  combination: { orchestrator, ...combination },
  duration,
}) {
  // eslint-disable-next-line fp/no-let
  let res = await receiveOutput(combination, orchestrator)

  // eslint-disable-next-line fp/no-loops, no-await-in-loop
  while (await waitForStart(orchestrator)) {
    // eslint-disable-next-line no-await-in-loop, fp/no-mutation
    res = await measureSample({ combination, orchestrator, res, duration })
  }
}

// Each combination is measured in a series of smaller samples
const measureSample = async function ({
  combination,
  orchestrator,
  res,
  duration,
}) {
  const sampleStart = getSampleStart()

  const [newRes] = await Promise.race([
    processCombination({ combination, orchestrator, res }),
    waitForSampleTimeout(duration, combination),
  ])

  addSampleDuration(combination, sampleStart)
  return newRes
}

// We are listening for output before sending input to prevent race condition
const processCombination = async function ({ combination, orchestrator, res }) {
  return await Promise.all([
    receiveOutput(combination, orchestrator),
    sendInput(combination, res),
  ])
}

// Send the next sample's input by responding to the HTTP long poll request.
// Runners use long polling:
//  - They send their output with a new HTTP request
//  - The server keeps the request alive until a new input is available, which
//    is then sent as a response
// We use long polling instead of real bidirectional procotols because it is
// simpler to implement in runners.
// There is only one single endpoint for each runner, meant to run a new
// measuring sample:
//   - The server sends some input to indicate how long to run the sample
//   - The runner sends the results back as output
const sendInput = async function (combination, res) {
  const input = getInput(combination)
  const inputString = JSON.stringify(input)
  await promisify(res.end.bind(res))(inputString)
}

// Receive the sample's output by receiving a HTTP long poll request.
const receiveOutput = async function (combination, orchestrator) {
  const { req, res: nextRes } = await waitForOutput(orchestrator)
  const output = await getJsonOutput(req)
  const newState = handleOutput(combination, output)
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(combination.state, newState)
  return nextRes
}

// Parse the request's JSON body
const getJsonOutput = async function (req) {
  try {
    const outputString = await getStream(req)
    const output = JSON.parse(outputString)
    return output
  } catch {
    throw new PluginError('Invalid JSON output')
  }
}

// The `duration` configuration property is also used for timeout. This ensures:
//  - child processes do not execute forever
//  - the user sets a `duration` higher than the task's duration
// The `exec` action does not use any timeout
// Timeouts are only meant to stop tasks that are longer than the `duration`.
// In that case, measuring is just impossible.
// Failing the benchmark is disruptive and should only be done when there is no
// possible fallback. For example, if a task was executed several times but
// becomes much slower in the middle of the combination (while still being
// slower than the `duration`), we should not fail. Instead, the task
// will just take a little longer. We must just make a best effort to minimize
// the likelihood of this to happen.
const waitForSampleTimeout = async function (duration, { taskId }) {
  const sampleTimeout = Math.round(duration / NANOSECS_TO_MILLISECS)
  await pSetTimeout(sampleTimeout)

  // TODO: use error messages from src/processes/error.js
  throw new UserError(`Task "${taskId}" ${TIMEOUT_ERROR}`)
}

const NANOSECS_TO_MILLISECS = 1e6
export const TIMEOUT_ERROR =
  'timed out. Please increase the "duration" configuration property.'
