import { getCombinations } from './combination/main.js'
import { checkLimits } from './compare/limit.js'
import { getConfig } from './config/main.js'
import { performExec } from './exec/main.js'
import {
  addToHistory,
  getFromHistory,
  removeFromHistory,
} from './history/main.js'
import { performBenchmark } from './measure/bench.js'
import { reportResult } from './report/main.js'

// Measure code defined in a tasks file and report the results.
// Default command.
export const bench = async function (configFlags) {
  const config = await getConfig('bench', configFlags)
  const { result, finalResult } = await performBenchmark(config)
  await addToHistory(result, config)
  checkLimits(finalResult, config)
  return finalResult
}

// Show a previous result
export const show = async function (configFlags) {
  const config = await getConfig('show', configFlags)
  const { result, previous } = await getFromHistory(config)
  const resultA = await reportResult(result, previous, config)
  return resultA
}

// Remove a previous result
export const remove = async function (configFlags) {
  const config = await getConfig('remove', configFlags)
  const { result, previous } = await getFromHistory(config)
  const resultA = await reportResult(result, previous, config)
  await removeFromHistory(resultA, config)
  return resultA
}

// Execute tasks without benchmarking them
export const exec = async function (configFlags) {
  const config = await getConfig('exec', configFlags)
  const { combinations } = await getCombinations(config)
  await performExec(config, combinations)
}
