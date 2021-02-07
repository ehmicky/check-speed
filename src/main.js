import { checkLimits } from './compare/limit.js'
import { getConfig } from './config/main.js'
import { performExec } from './exec/main.js'
import { performBenchmark } from './measure/bench.js'
import { report } from './report/main.js'
import {
  addToStore,
  getFromStore,
  listAll,
  removeFromStore,
} from './store/main.js'

// Measure code defined in a tasks file and report the results.
// Default command.
export const bench = async function (configFlags) {
  const config = await getConfig('bench', configFlags)
  const results = await listAll(config)
  const { rawResult, result, stopped } = await performBenchmark(config, results)
  await addToStore(rawResult, config, stopped)
  await report(result, config)
  checkLimits(result, config)
  return result
}

// Show a previous result
export const show = async function (configFlags) {
  const { delta, ...config } = await getConfig('show', configFlags)
  const result = await getFromStore(delta, config)
  await report(result, config)
  return result
}

// Remove a previous result
export const remove = async function (configFlags) {
  const { delta, ...config } = await getConfig('remove', configFlags)
  const result = await getFromStore(delta, config)
  await removeFromStore(result, config)
}

// Execute tasks without benchmarking them
export const exec = async function (configFlags) {
  const config = await getConfig('exec', configFlags)
  await performExec(config)
}
