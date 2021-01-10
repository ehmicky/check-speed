import omit from 'omit.js'

import { UserError } from '../error/main.js'

import { listStore } from './list.js'

// Add a new result
export const addToStore = async function ({
  partialResult,
  partialResult: { id },
  config,
  stopped,
}) {
  await save({ partialResult, config, stopped })
  const results = await listStore(config)
  const resultA = results.find((result) => result.ids.includes(id))
  return { result: resultA, results }
}

// Save results so they can be compared or shown later.
// We do not save stopped benchmarks.
const save = async function ({
  partialResult,
  config: { save: saveConfig, store },
  stopped,
}) {
  if (!saveConfig || stopped) {
    return
  }

  const partialResultA = normalizeResult(partialResult)

  try {
    await store.add(partialResultA)
  } catch (error) {
    throw new UserError(`Could not save result: ${error.message}`)
  }
}

// Results that are too big are not persisted.
// We otherwise try to persist everything, so that `show` report the same
// information.
// We try to only persist what cannot be computed runtime (which is done by
// `addPrintedInfo()` during reporting).
const normalizeResult = function ({ combinations, ...result }) {
  const combinationsA = combinations.map(normalizeCombination)
  return { ...result, combinations: combinationsA }
}

const normalizeCombination = function ({ stats, ...combination }) {
  const statsA = omit(stats, OMITTED_STATS_PROPS)
  return { ...combination, stats: statsA }
}

const OMITTED_STATS_PROPS = ['histogram', 'quantiles']
