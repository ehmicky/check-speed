import now from 'precise-now'

import { getMinLoopTime } from './min_loop_time.js'
import { getNowBias } from './now_bias.js'
import { measureProcessGroup } from './process_group.js'
import { getRepeatCost } from './repeat_cost.js'

// We measure by spawning processes until reaching the max `duration`.
// At least one process must be executed.
// We launch child processes serially:
//  - otherwise they would slow down each other and have higher variance
//  - multi-core CPUs are designed to execute in parallel but in practice they
//    do impact the performance of each other
//  - this does mean we are under-utilizing CPUs
// eslint-disable-next-line max-lines-per-function
export const measureCombination = async function ({
  taskPath,
  taskId,
  inputId,
  commandSpawn,
  commandSpawnOptions,
  commandOpt,
  loadDuration,
  duration,
  combinationEnd,
  cwd,
}) {
  const biasDuration = duration * BIAS_DURATION_RATIO
  const nowBias = await getNowBias({
    taskPath,
    taskId,
    inputId,
    commandSpawn,
    commandSpawnOptions,
    commandOpt,
    processGroupDuration: biasDuration,
    cwd,
    loadDuration,
  })
  const minLoopTime = getMinLoopTime(nowBias, duration)
  const repeatCost = await getRepeatCost({
    taskPath,
    taskId,
    inputId,
    commandSpawn,
    commandSpawnOptions,
    commandOpt,
    processGroupDuration: biasDuration,
    cwd,
    loadDuration,
    nowBias,
    minLoopTime,
  })
  const { times, count, processes } = await measureProcessGroup({
    taskPath,
    taskId,
    inputId,
    commandSpawn,
    commandSpawnOptions,
    commandOpt,
    processGroupDuration: combinationEnd - now(),
    cwd,
    loadDuration,
    nowBias,
    repeatCost,
    minLoopTime,
    initialRepeat: 1,
    dry: false,
  })
  return { times, count, processes }
}

// Biases must be very precise to measure fast tasks accurately.
// So we dedicate a significant part of the total combination to them.
const BIAS_DURATION_RATIO = 0.1