import { throwOnProcessExit } from '../process/error.js'
import { throwIfStopped } from '../stop/error.js'

import { runStartEnd } from './start_end.js'

// Handle errors during measuring.
// Asynchronous errors (SIGINT, child process exit):
//  - Are handled as soon as possible
//  - However, they only throw once all other initializing logic has been
//    performed
//  - This ensures that all initializers and finalizers are always called
//    and in order
export const handleErrorsAndMeasure = async function ({
  combination,
  precisionTarget,
  previewState,
  stopState,
  stopState: { onAbort },
  stage,
  server,
  childProcess,
  logsFd,
}) {
  try {
    const returnValue = await Promise.race([
      throwOnProcessExit(childProcess),
      onAbort,
      runStartEnd({
        combination,
        precisionTarget,
        previewState,
        stopState,
        stage,
        server,
        logsFd,
      }),
    ])
    throwIfStopped(stopState)
    return returnValue
  } catch (error) {
    prependTaskPrefix(error, combination, stage)
    throw error
  }
}

const prependTaskPrefix = function (error, { taskId }, stage) {
  if (stage === 'init' || error.name === 'StopError') {
    return
  }

  const taskPrefix = `In task "${taskId}"`
  error.message = `${taskPrefix}:\n${error.message}`
}
