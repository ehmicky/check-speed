import { getLengthFromLoops } from './extreme.js'
import { getTvalue } from './tvalue.js'

// Check whether two combinations are too close for their `diff` to be
// statistically significant.
// We do this using a median-based Welch's t-test instead of:
//  - Student's t-test because it assumes variances are the same
//  - Mann-Whitney u-test because it:
//     - Compares the distributions, not just the means/medians
//     - Has a slower time complexity O(n^2)
//     - Is more complex to implement
//     - Assumes both combinations have similar distributions
//     - Is not as good with skewed distributions
//  - Confidence interval `medianLow|medianHigh` because doing so is less
//    statistically accurate
//     - However, this method should be used by users when comparing two
//       combinations of the same result because:
//        - It can be easily done visually
//        - Doing a Welch's t-test between each pair of combinations would
//          be hard to report
// In a nutshell, this is is based on the medians difference, number of loops
// and standard deviations:
//  - The t-value improves proportionally with a:
//     - higher difference of medians (O(n))
//     - lower stdev (O(n**1/2))
//     - higher length (O(n**1/4))
//  - The degrees of freedom improve proportionally with a:
//     - higher length (O(n**1/2))
//  - Both of them improve proportionally with a lower difference of
//    stdev|length
//     - this means, at some point, increasing the number of loops of the
//       current combination might make its diff imprecise. However, the
//       variation is minimal.
export const isDiffPrecise = function (
  { median: medianA, stdev: stdevA, loops: loopsA },
  { median: medianB, stdev: stdevB, loops: loopsB },
) {
  const { length: lengthA } = getLengthFromLoops(loopsA)
  const { length: lengthB } = getLengthFromLoops(loopsB)
  return welchTTest({ medianA, stdevA, lengthA, medianB, stdevB, lengthB })
}

const welchTTest = function ({
  medianA,
  stdevA,
  lengthA,
  medianB,
  stdevB,
  lengthB,
}) {
  if (isTooImprecise({ lengthA, stdevA, lengthB, stdevB })) {
    return false
  }

  const errorSquaredA = getErrorSquared(stdevA, lengthA)
  const errorSquaredB = getErrorSquared(stdevB, lengthB)
  const tStat = Math.abs(
    (medianA - medianB) / Math.sqrt(errorSquaredA + errorSquaredB),
  )
  const degreesOfFreedom =
    (errorSquaredA + errorSquaredB) ** 2 /
    (errorSquaredA ** 2 / (lengthA - 1) + errorSquaredB ** 2 / (lengthB - 1))
  const tValue = getTvalue(Math.floor(degreesOfFreedom))
  return tStat >= tValue
}

// Welch's t-test does not work with extremely low `length` or `stdev`, but
// those would indicate that diff is most likely imprecise anyway.
const isTooImprecise = function ({ lengthA, stdevA, lengthB, stdevB }) {
  return lengthA <= 1 || lengthB <= 1 || (stdevA === 0 && stdevB === 0)
}

const getErrorSquared = function (stdev, length) {
  return (stdev / Math.sqrt(length)) ** 2
}
