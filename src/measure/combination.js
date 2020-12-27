import { setDescription, setDelayedDescription } from '../progress/set.js'

import { getSampleStart, addSampleDuration } from './duration.js'
import { sendAndReceive, sendParams, receiveReturnValue } from './ipc.js'
import {
  getMeasureDurationStart,
  getMeasureDurationLast,
} from './measure_duration.js'
import { getNextCombination } from './next.js'
import { getParams } from './params.js'
import { handleReturnValue } from './return.js'

// Measure all combinations, until there is no `duration` left.
// When the logic involving a combination throws, we do not propagate the
// exception right away. This allows the combination and other combinations
// to properly stop and exit.
export const measureCombinations = async function (
  combinations,
  progressState,
) {
  const combinationsA = await startCombinations(combinations, progressState)
  const combinationsB = await measureSamples(combinationsA, progressState)
  const combinationsC = await stopCombinations(combinationsB, progressState)
  const combinationsD = await exitCombinations(combinationsC)
  return combinationsD
}

const startCombinations = async function (combinations, progressState) {
  const combinationsA = await Promise.all(combinations.map(startCombination))
  setDescription(progressState, '')
  return combinationsA
}

const startCombination = async function (combination) {
  const { newCombination } = await receiveReturnValue(combination)
  return newCombination
}

// We ensure combinations are never measured at the same time
//  - Otherwise, they would compete for memory and CPU, making results less
//    precise.
//  - Start, stop and exit can be run in parallel though since they do not
//    measure
// We also break down each combination into samples, i.e. small units of
// duration when measures are taken:
//  - This allows combinations to be live reported at the same time, displaying
//    them competing with each other
//  - This allows some parameters to be callibrated (e.g. `repeat`)
//  - This helps during manual interruptions (CTRL-C) by allowing samples to
//    end so tasks can be cleaned up
//  - This provides with fast fail if one of the combinations fails
const measureSamples = async function (combinations, progressState) {
  const combinationMaxLoops = getCombinationMaxLoops(combinations)

  // eslint-disable-next-line fp/no-loops
  while (true) {
    const sampleStart = getSampleStart()
    const combination = getNextCombination(
      combinations,
      progressState,
      combinationMaxLoops,
    )

    // eslint-disable-next-line max-depth
    if (combination === undefined) {
      break
    }

    // eslint-disable-next-line no-await-in-loop
    const newCombination = await measureSample(combination)
    const newCombinationA = addSampleDuration(newCombination, sampleStart)
    // eslint-disable-next-line fp/no-mutation, no-param-reassign
    combinations = updateCombinations(
      combinations,
      newCombinationA,
      combination,
    )
  }

  return combinations
}

const getCombinationMaxLoops = function (combinations) {
  return Math.ceil(MAX_LOOPS / combinations.length)
}

// We stop running samples when the `measures` is over `MAX_LOOPS`. This
// is meant to prevent memory overflow.
// The default limit for V8 in Node.js is 1.7GB, which allows measures to hold a
// little more than 1e8 floats.
const MAX_LOOPS = 1e8

const measureSample = async function (combination) {
  const params = getParams(combination)

  const measureDurationStart = getMeasureDurationStart()
  const { newCombination, returnValue } = await sendAndReceive(
    combination,
    params,
  )
  const measureDurationLast = getMeasureDurationLast(measureDurationStart)

  const newProps = handleReturnValue(
    { ...newCombination, measureDurationLast },
    returnValue,
    params,
  )
  return { ...newCombination, ...newProps }
}

const updateCombinations = function (
  combinations,
  newCombination,
  oldCombination,
) {
  return combinations.map((combination) =>
    updateCombination(combination, newCombination, oldCombination),
  )
}

const updateCombination = function (
  combination,
  newCombination,
  oldCombination,
) {
  return combination === oldCombination ? newCombination : combination
}

const stopCombinations = async function (combinations, progressState) {
  setDelayedDescription(progressState, STOP_DESCRIPTION)
  return await Promise.all(combinations.map(stopCombination))
}

const STOP_DESCRIPTION = 'Finishing...'

const stopCombination = async function (combination) {
  const { newCombination } = await sendAndReceive(combination, {})
  return newCombination
}

const exitCombinations = async function (combinations) {
  return await Promise.all(combinations.map(exitCombination))
}

const exitCombination = async function (combination) {
  await sendParams(combination, {})
  return combination
}
