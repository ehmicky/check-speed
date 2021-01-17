import { performBenchmark } from './bench.js'
import { getConfig } from './config/main.js'
import { performExec } from './exec.js'
import { report } from './report/main.js'
import { addToStore } from './store/add.js'
import { endStore } from './store/end.js'
import { getFromStore } from './store/get.js'
import { listStore } from './store/list.js'
import { removeFromStore } from './store/remove.js'
import { startStore } from './store/start.js'

// Measure code defined in a tasks file and report the results.
// Default action.
export const bench = async function (configFlags) {
  const configA = await getConfig('bench', configFlags)
  const configB = await startStore(configA)

  try {
    const results = await listStore(configB)
    const { result, stopped } = await performBenchmark(configB)
    const resultA = await addToStore({
      results,
      result,
      config: configB,
      stopped,
    })
    await report(resultA, configB)
    return resultA
  } finally {
    await endStore(configB)
  }
}

// Show a previous result
export const show = async function (configFlags) {
  const { delta, ...configA } = await getConfig('show', configFlags)
  const configB = await startStore(configA)

  try {
    const results = await listStore(configB)
    const result = getFromStore(results, delta)
    await report(result, configB)
    return result
  } finally {
    await endStore(configB)
  }
}

// Remove a previous result
export const remove = async function (configFlags) {
  const { delta, ...configA } = await getConfig('remove', configFlags)
  const configB = await startStore(configA)

  try {
    const results = await listStore(configB)
    const result = getFromStore(results, delta)
    await removeFromStore(result, configB)
  } finally {
    await endStore(configA)
  }
}

// Execute tasks without benchmarking them
export const exec = async function (configFlags) {
  const configA = await getConfig('exec', configFlags)

  await performExec(configA)
}
