import { promisify } from 'util'

import pEvent from 'p-event'

import { failOnExit, reportStderr } from './exit.js'

// Receive IPC message from parent to child
export const getChildMessage = async function(child, eventName) {
  const payload = await Promise.race([
    getMessage(child, eventName),
    failOnExit(child),
  ])
  return payload
}

// Send IPC message from parent to child
export const sendChildMessage = async function(child, eventName, payload) {
  try {
    await sendMessage(child, eventName, payload)
  } catch (error) {
    await reportStderr(child)
    throw error
  }
}

// Receive IPC message from child to parent
export const getParentMessage = async function(eventName) {
  // eslint-disable-next-line no-restricted-globals, node/prefer-global/process
  const payload = await getMessage(process, eventName)
  return payload
}

// Send IPC message from child to parent
export const sendParentMessage = async function(eventName, payload) {
  // eslint-disable-next-line no-restricted-globals, node/prefer-global/process
  await sendMessage(process, eventName, payload)
}

const getMessage = async function(processObject, eventName) {
  const [, payload] = await pEvent(
    processObject,
    'message',
    ([eventNameA]) => eventNameA === eventName,
  )
  return payload
}

const sendMessage = async function(processObject, eventName, payload) {
  await promisify(processObject.send.bind(processObject))([eventName, payload])
}
