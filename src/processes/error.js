import { getTimeoutError } from './timeout.js'

// Forward any child process error
export const forwardChildError = function ({
  shortMessage,
  failed,
  timedOut,
  duration,
  taskPath,
  stdout,
  stderr,
  result,
  taskId,
  variationId,
}) {
  if (!failed) {
    return
  }

  const messageA = getMessage({
    shortMessage,
    timedOut,
    duration,
    taskPath,
    stdout,
    stderr,
    result,
    taskId,
    variationId,
  })
  throw new Error(messageA)
}

const getMessage = function ({
  shortMessage,
  timedOut,
  duration,
  taskPath,
  stdout,
  stderr,
  result: { error: errorResult },
  taskId,
  variationId,
}) {
  const taskPrefix = getTaskPrefix({ taskPath, taskId, variationId })

  if (timedOut) {
    const timeoutError = getTimeoutError(duration)
    return `${taskPrefix}${timeoutError}`
  }

  const execaError = getExecaError(shortMessage)
  return [`${taskPrefix}${execaError}`, errorResult, stderr, stdout]
    .filter(Boolean)
    .join('\n\n')
}

// Add task/variation context to child process errors
const getTaskPrefix = function ({ taskPath, taskId, variationId }) {
  if (taskId === undefined) {
    return `In '${taskPath}': `
  }

  if (variationId === '') {
    return `In '${taskPath}', task '${taskId}': `
  }

  return `In '${taskPath}', task '${taskId}' (variation '${variationId}'): `
}

const getExecaError = function (shortMessage) {
  return shortMessage
    .replace(EXECA_MESSAGE_START, '')
    .replace(EXECA_MESSAGE_END, '')
}

const EXECA_MESSAGE_START = 'Command '
const EXECA_MESSAGE_END = /: .*/u
