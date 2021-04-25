import process from 'process'

import { StopError } from '../error/main.js'
import { updateDescription } from '../preview/update.js'
import {
  createController,
  waitForEvents,
  waitForDelay,
} from '../utils/timeout.js'

// Allow users to stop measuring by using signals like SIGINT (CTRL-C).
// When this happens, combinations still properly end.
// The user can hit the same signal twice to abort immediately instead.
// When stopping, we do not save results to allow continuing later because this
// requires spawning processes again, making them go through cold starts again.
// This would decrease precision and create difference between results depending
// on how many times the benchmark was stopped/continued.
export const addStopHandler = function (previewState) {
  const stopState = { stopped: false }
  const noopHandler = removeDefaultHandlers()
  const { abortSignal, abort } = createController()
  const onAbort = handleStop(stopState, previewState, abortSignal)
  const removeStopHandlerA = removeStopHandler.bind(
    undefined,
    abort,
    noopHandler,
  )
  return { stopState, onAbort, removeStopHandler: removeStopHandlerA }
}

// Ensure default handlers for those signals are not used.
// Create a new `noop` function at each call, in case this function is called
// several times in parallel.
const removeDefaultHandlers = function () {
  const noopHandler = noop.bind()
  STOP_SIGNALS.forEach((signal) => {
    process.on(signal, noopHandler)
  })
  return noopHandler
}

// eslint-disable-next-line no-empty-function
const noop = function () {}

const restoreDefaultHandlers = function (signalHandler) {
  STOP_SIGNALS.forEach((signal) => {
    process.off(signal, signalHandler)
  })
}

const handleStop = async function (stopState, previewState, abortSignal) {
  await waitForStopSignals(abortSignal)

  await updateDescription(previewState, STOP_DESCRIPTION)
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  stopState.stopped = true

  await waitForDelay(ABORT_DELAY, abortSignal)
  await updateDescription(previewState, ABORT_DESCRIPTION)

  await waitForStopSignals(abortSignal)

  throw new StopError('Benchmark has been aborted.')
}

const waitForStopSignals = async function (abortSignal) {
  await waitForEvents(process, STOP_SIGNALS, abortSignal)
}

// Signals usually done interactively by user in terminals, cross-platform.
// We allow non-interactive signals sending too for programmatic usage.
const STOP_SIGNALS = ['SIGINT', 'SIGBREAK', 'SIGHUP', 'SIGTERM', 'SIGQUIT']

const STOP_DESCRIPTION = 'Stopping'
const ABORT_DESCRIPTION = 'Stopping. Type CTRL-C to abort graceful exit.'

// Users must wait 5 seconds before being able to abort.
// This promotes proper cleanup.
// Also, this prevents misuse due to users mistakenly hitting the keys twice.
const ABORT_DELAY = 5e3

// Undo signal handling
const removeStopHandler = function (abort, signalHandler) {
  abort()
  restoreDefaultHandlers(signalHandler)
}

// Throws on graceful stops.
// Not done if a user exception was thrown
export const throwIfStopped = function ({ stopped }) {
  if (!stopped) {
    return
  }

  throw new StopError('Benchmark has been stopped.')
}
