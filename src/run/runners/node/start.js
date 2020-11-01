import { runMethod } from '../common/ipc.js'

import { benchmark } from './benchmark/main.js'
import { debugRun } from './debug.js'
import { loadBenchmarkFile } from './load/main.js'

// Communicate iterations ids and titles to parent
const load = async function ({ taskPath, opts }) {
  const iterations = await loadBenchmarkFile(taskPath, opts)
  const iterationsA = iterations.map(getIteration)
  return { iterations: iterationsA }
}

const getIteration = function ({
  taskId,
  taskTitle,
  variationTitle,
  variationId,
}) {
  return { taskId, taskTitle, variationId, variationTitle }
}

// Run benchmarks
const run = async function ({ taskPath, opts, taskId, variationId, duration }) {
  const { main, before, after } = await getTask({
    taskPath,
    opts,
    taskId,
    variationId,
  })
  const { times, count } = await benchmark({ main, before, after, duration })
  return { times, count }
}

const debug = async function ({ taskPath, opts, taskId, variationId }) {
  const { main, before, after } = await getTask({
    taskPath,
    opts,
    taskId,
    variationId,
  })
  await debugRun({ main, before, after })
  return {}
}

const getTask = async function ({ taskPath, opts, taskId, variationId }) {
  const iterations = await loadBenchmarkFile(taskPath, opts)

  const { main, before, after } = iterations.find(
    (iteration) =>
      iteration.taskId === taskId && iteration.variationId === variationId,
  )
  return { main, before, after }
}

runMethod({ load, run, debug })
