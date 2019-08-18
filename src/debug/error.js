// Forward any child process error
export const forwardChildError = function({
  child,
  exitCode,
  signal,
  error,
  taskId,
  variationId,
}) {
  if (!hasChildError({ exitCode, signal, error })) {
    return
  }

  // The child process might already have exited. In that case, this is a noop.
  child.kill()

  const taskError = getTaskError(taskId, variationId)

  const message = getErrorMessage({
    taskError,
    signal,
    exitCode,
    error,
  })
  throw new Error(message)
}

const hasChildError = function({ exitCode, signal, error }) {
  return exitCode !== 0 || signal !== null || error !== undefined
}

// Add task/variation context to child process errors
const getTaskError = function(taskId, variationId) {
  if (taskId === undefined) {
    return ''
  }

  if (variationId === '') {
    return `Task '${taskId}': `
  }

  return `Task '${taskId}' (variation '${variationId}'): `
}

const getErrorMessage = function({ taskError, signal, exitCode, error }) {
  const signalError = getSignalError(signal)
  const exitCodeError = getExitCodeError(exitCode)
  const errorStack = getErrorStack(error)
  return `${taskError}Child process exited${signalError}${exitCodeError}${errorStack}`
}

const getSignalError = function(signal) {
  if (signal === null || signal === undefined) {
    return ''
  }

  return ` with ${signal}`
}

const getExitCodeError = function(exitCode) {
  if (exitCode === 0 || exitCode === null || exitCode === undefined) {
    return ''
  }

  return ` (exit code ${exitCode})`
}

const getErrorStack = function(error) {
  if (error === undefined) {
    return ''
  }

  return `\n\n${error.stack}`
}
