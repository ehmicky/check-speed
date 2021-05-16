import { isSameCategory, isUniqueCombination } from './ids.js'

// Keep track of combinations' `resultId`
export const addResultIds = function (result) {
  const combinations = result.combinations.map((combination) => ({
    ...combination,
    resultId: result.id,
  }))
  return { ...result, combinations }
}

// Return all the combinations that are in `results` but not in `result`
export const getNewCombinations = function (result, results) {
  const combinations = getResultsCombinations(results)
  return combinations
    .filter(isUniqueCombination)
    .filter(
      (resultCombination) => !resultHasCombination(result, resultCombination),
    )
}

// Return all combinations in `results`
export const getResultsCombinations = function (results) {
  return results.flatMap(getCombinations)
}

const getCombinations = function ({ combinations }) {
  return combinations
}

// Return whether a result has a specific combination
export const resultHasCombination = function ({ combinations }, combination) {
  return getMatchingCombination(combinations, combination) !== undefined
}

// Return the same combination with the same identifiers
export const getMatchingCombination = function (combinations, combination) {
  return combinations.find((combinationA) =>
    isSameCategory(combinationA, combination),
  )
}
