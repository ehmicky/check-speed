import now from 'precise-now'

import { executeChild } from '../processes/main.js'
import { removeOutliers } from '../stats/outliers.js'

import { getMedian } from './median.js'
import { normalizeTimes } from './normalize.js'
import { adjustRepeat } from './repeat.js'

// eslint-disable-next-line max-statements, max-lines-per-function
export const runMeasureLoop = async function ({
  taskPath,
  taskId,
  inputId,
  commandSpawn,
  commandSpawnOptions,
  commandOpt,
  measureDuration,
  cwd,
  benchmarkCost,
  benchmarkCostMin,
  nowBias,
  loopBias,
  minTime,
  dry,
}) {
  const runEnd = now() + measureDuration
  const eventPayload = {
    type: 'run',
    opts: commandOpt,
    taskPath,
    taskId,
    inputId,
    dry,
  }
  const results = []
  // eslint-disable-next-line fp/no-let
  let totalTimes = 0
  const processMedians = []
  // eslint-disable-next-line fp/no-let
  let median = 0
  // eslint-disable-next-line fp/no-let
  let repeat = 1

  // eslint-disable-next-line fp/no-loops
  do {
    const timeLeft = runEnd - now()
    const maxTimeLeftMeasuring = timeLeft - benchmarkCost
    const maxDuration = Math.min(benchmarkCostMin, maxTimeLeftMeasuring)

    // eslint-disable-next-line no-await-in-loop
    const { times: childTimes } = await executeChild({
      commandSpawn,
      commandSpawnOptions,
      eventPayload: { ...eventPayload, maxDuration, repeat },
      timeoutNs: measureDuration,
      cwd,
      taskId,
      inputId,
      type: 'iterationRun',
    })
    normalizeTimes(childTimes, { nowBias, loopBias, repeat })

    // eslint-disable-next-line fp/no-mutating-methods
    results.push({ childTimes, repeat })
    // eslint-disable-next-line fp/no-mutation
    totalTimes += childTimes.length

    // eslint-disable-next-line fp/no-mutation
    median = getMedian(childTimes, processMedians)
    // eslint-disable-next-line fp/no-mutation
    repeat = adjustRepeat({ repeat, minTime, loopBias, median })
  } while (
    !shouldStopLoop({
      benchmarkCost,
      nowBias,
      median,
      runEnd,
      totalTimes,
    })
  )

  const { times, count, processes } = removeOutliers(results)
  return { times, count, processes }
}

// We stop iterating when the next process does not have any time to run a
// single loop. We estimate this taking into account the time to launch the
// runner (`benchmarkCost`), the time to benchmark the task (`nowBias`) and
// the time of the task itself, based on previous measurements (`median`).
const shouldStopLoop = function ({
  benchmarkCost,
  nowBias,
  median,
  runEnd,
  totalTimes,
}) {
  return (
    totalTimes >= TOTAL_MAX_TIMES ||
    now() + benchmarkCost + nowBias + median >= runEnd
  )
}

// We stop child processes when the `results` is over `TOTAL_MAX_TIMES`. This
// is meant to prevent memory overflow.
// The default limit for V8 in Node.js is 1.7GB, which allows times to holds a
// little more than 1e8 floats.
const TOTAL_MAX_TIMES = 1e8
