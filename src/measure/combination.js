import { getSampleStart, addSampleDuration } from './duration.js'
import { sendAndReceive, sendParams, receiveReturnValue } from './ipc.js'
import { getNextCombination } from './next.js'
import { getParams } from './params.js'
import { handleReturnValue } from './return.js'

// Measure all combinations, until there is no `duration` left.
export const measureCombinations = async function (combinations, benchmarkEnd) {
  const combinationsA = await Promise.all(combinations.map(waitForLoad))
  const combinationsB = await measureSamples(combinationsA, benchmarkEnd)
  const combinationsC = await Promise.all(combinationsB.map(stopCombination))
  return combinationsC
}

const waitForLoad = async function (combination) {
  const { newCombination } = await receiveReturnValue(combination)
  return newCombination
}

// We ensure combinations are never measured at the same time
//  - Otherwise, they would compete for memory and CPU, making results less
//    precise.
//  - Load and exit can be run in parallel though since they do not measure
// We also break down each combination into samples, i.e. small units of
// duration when measures are taken:
//  - This allows combinations to be live reported at the same time, displaying
//    them competing with each other
//  - This allows some parameters to be callibrated (e.g. `repeat`)
//  - This helps during manual interruptions (CTRL-C) by allowing samples to
//    end so tasks can be cleaned up
//  - This provides with fast fail if one of the combinations fails
const measureSamples = async function (combinations, benchmarkEnd) {
  // eslint-disable-next-line fp/no-loops
  while (true) {
    const combination = getNextCombination(combinations, benchmarkEnd)

    // eslint-disable-next-line max-depth
    if (combination === undefined) {
      break
    }

    // eslint-disable-next-line no-await-in-loop
    const newCombination = await addSample(combination)
    // eslint-disable-next-line fp/no-mutation, no-param-reassign
    combinations = updateCombinations(combinations, newCombination, combination)
  }

  return combinations
}

const addSample = async function (combination) {
  const sampleStart = getSampleStart()

  const newCombination = await measureSample(combination)

  const newCombinationA = addSampleDuration(newCombination, sampleStart)
  return newCombinationA
}

const measureSample = async function (combination) {
  const params = getParams(combination)
  const { newCombination, returnValue } = await sendAndReceive(
    combination,
    params,
  )
  const newProps = handleReturnValue(newCombination, returnValue, params)
  return { ...newCombination, ...newProps }
}

const stopCombination = async function (combination) {
  const { newCombination } = await sendAndReceive(combination, {})
  await sendParams(newCombination, {})
  return newCombination
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
