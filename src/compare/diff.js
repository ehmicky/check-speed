import {
  getMatchingCombination,
  resultsHaveCombinations,
} from '../combination/result.js'
import { isDiffPrecise } from '../stats/welch.js'

// Add `combination.stats.diff` which compares each combination with another
// result.
// Which result is being compared depends on the `since` configuration property.
// By default, it is the previous result but it can be any earlier result.
// If the compared result does not have the combination to compare, we use the
// most recent result before it instead.
// `combination.stats.diff` is always set and is used both by:
//  - Reporters, unless the `showDiff` configuration property is `false`
//  - The `limit` configuration property to do performance testing
// `combination.stats.diff` is not persisted in history since it can be computed
// dynamically.
//  - Also some results might have been dynamically deleted or filtered out.
export const addCombinationsDiff = function (result) {
  const { history } = result

  if (history.length <= 1) {
    return result
  }

  const [sinceResult, ...afterSince] = history
  const combinations = result.combinations.map((combination) =>
    addCombinationDiff(combination, sinceResult, afterSince),
  )
  return { ...result, combinations }
}

const addCombinationDiff = function (
  combination,
  { combinations: previousCombinations },
  afterSince,
) {
  const previousCombinationA = getMatchingCombination(
    previousCombinations,
    combination,
  )

  if (!shouldAddDiff(previousCombinationA, afterSince)) {
    return combination
  }

  const diffStats = getDiff(combination.stats, previousCombinationA.stats)
  return { ...combination, stats: { ...combination.stats, ...diffStats } }
}

// We only show the `diff` when:
//  - There is a previous combination to compare with.
//  - That combination is not the same as the one being compared. This could
//    happen when merging results and the combination was taken from
//    `sinceResult` (instead of `afterSince`).
const shouldAddDiff = function (previousCombination, afterSince) {
  return (
    previousCombination !== undefined &&
    resultsHaveCombinations(afterSince, previousCombination)
  )
}

// `median` can be `undefined` during preview
// `isDiffPrecise` is whether `diff` is statistically significant.
//   - We set `diffPrecise: true` when this happens which results in:
//      - `limit` not being used
//      - no colors
//      - an "approximately equal" sign being prepended
//   - We do not try to hide or show the `diff` as 0% instead since users might:
//      - think it is due to a bug
//      - compute the diff themselves anyway
const getDiff = function (stats, previousStats) {
  const { median } = stats
  const { median: previousMedian } = previousStats

  if (median === undefined || median === 0 || previousMedian === 0) {
    return {}
  }

  const diff = median / previousMedian - 1
  const diffPrecise = isDiffPrecise(stats, previousStats)
  return { diff, diffPrecise }
}
