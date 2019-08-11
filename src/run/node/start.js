import { exit } from 'process'

import { benchmark } from './benchmark/main.js'
import { loadTaskFile } from './load/main.js'
import { getInput, sendOutput, sendError } from './ipc.js'

// Child process entry point
const start = async function() {
  try {
    const { type, ...input } = getInput()
    const output = await TYPES[type](input)
    await sendOutput(output)
  } catch (error) {
    await sendError(error)
    exit(1)
  }
}

// Communicate iterations ids and titles to parent
const load = async function({ taskPath, opts }) {
  const iterations = await loadTaskFile(taskPath, opts)
  const iterationsA = iterations.map(getIteration)
  return { iterations: iterationsA }
}

const getIteration = function({
  taskId,
  taskTitle,
  variationId,
  variationTitle,
}) {
  return { taskId, taskTitle, variationId, variationTitle }
}

// Run benchmarks
const run = async function({ taskPath, opts, taskId, variationId, duration }) {
  const iterations = await loadTaskFile(taskPath, opts)

  const { main, before, after } = iterations.find(
    iteration =>
      iteration.taskId === taskId && iteration.variationId === variationId,
  )
  const { times, count } = await benchmark({ main, before, after, duration })
  return { times, count }
}

const TYPES = { load, run }

start()
