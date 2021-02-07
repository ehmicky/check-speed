import { getDeltaError } from '../delta/error.js'
import { findByDelta } from '../delta/main.js'
import { UserError } from '../error/main.js'
import { compressResult } from '../normalize/compress.js'
import { loadResults } from '../normalize/load.js'
import { mergeResults, applySince } from '../normalize/merge.js'

import { addResult, removeResult, listResults } from './results.js'

// Save results so they can be compared or shown later.
// We do not save stopped benchmarks.
export const addToHistory = async function (result, { save, cwd }, stopped) {
  if (!save || stopped) {
    return
  }

  const resultA = compressResult(result)
  await addResult(resultA, cwd)
}

// Remove a result
export const removeFromHistoy = async function (config) {
  const { id } = await getFromHistory(config)
  await removeResult(id, config.cwd)
}

// List all results and apply `since`.
// We try to apply `since` as soon as possible so user errors with that
// configuration property fail early.
export const listHistory = async function (config) {
  const results = await listNormalizedResults(config)
  const resultsA = await applySince(results, config)
  return resultsA
}

// Get a previous result by `count` or `timestamp`
export const getFromHistory = async function (config) {
  const results = await listNormalizedResults(config)
  const { lastResult, previous } = await listResultsByDelta(results, config)
  const previousA = await applySince(previous, config)
  const result = mergeResults(lastResult, previousA)
  return result
}

// List, sort, filter and normalize all results
// This is performed at the beginning of all commands because this allows:
//  - Failing fast if there is a problem with the history
//  - Including previous|diff in results preview
const listNormalizedResults = async function ({ cwd, include, exclude }) {
  const results = await listResults(cwd)
  const resultsA = loadResults({ results, include, exclude })
  return resultsA
}

const listResultsByDelta = async function (results, { delta, cwd }) {
  if (results.length === 0) {
    throw new UserError('No previous results.')
  }

  const index = await findByDelta(results, delta, cwd)

  if (index === -1) {
    const deltaError = getDeltaError(delta)
    throw new UserError(`${deltaError} matches no results.`)
  }

  const lastResult = results[index]
  const previous = results.slice(0, index)
  return { lastResult, previous }
}