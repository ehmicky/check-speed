import { UserError } from '../error/main.js'
import { selectResults } from '../select/main.js'

import { decompressResults } from './compress.js'
import { groupCombinations } from './group.js'
import { migrateResults } from './migrate.js'
import { sortResults } from './sort.js'

// List, sort, filter and normalize all results
export const listStore = async function ({ store, include, exclude }) {
  const results = await callList(store)
  const resultsA = migrateResults(results)
  const resultsB = decompressResults(resultsA)
  const resultsC = sortResults(resultsB)
  const resultsD = selectResults(resultsC, { include, exclude })
  const resultsE = groupCombinations(resultsD)
  return resultsE
}

// Call `store.list()`
const callList = async function (store) {
  try {
    return await store.list()
  } catch (error) {
    throw new UserError(`Could not list previous results: ${error.message}`)
  }
}
