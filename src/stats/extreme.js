import { getRoundedPosition } from './quantile.js'

// Measures usually contain some very slow outliers due to background processes
// or engine optimization.
// Those are useful to know as they indicate:
//  - worst-case scenarios (`min`, `max`, `quantiles`)
//  - average performance when repeated (`mean`)
// However, those are not good when determining the normal distribution of
// measures:
//  - they create a distribution with a very long tail, which is hard to
//    visualize with `histogram`
//  - they make `deviation` and `moe` must less useful
// For the later cases, we remove those outliers.
// We also remove the fastest outliers for similar reasons, although they are
// less frequent.
// We apply those percentage without cloning the `measures` array, for
// performance and memory reasons.
export const getExtremes = function (measures) {
  const [min] = measures
  const max = measures[measures.length - 1]

  const lowIndex = getRoundedPosition(measures, LOW_OUTLIERS)
  const highIndex = getRoundedPosition(measures, HIGH_OUTLIERS)
  const low = measures[lowIndex]
  const high = measures[highIndex]
  return { min, max, lowIndex, highIndex, low, high }
}

// A higher value makes histograms give less information about very low/high
// values.
// A lower value makes it more likely for outliers to overtake the histogram,
// concentrating most of the values into far fewer buckets.
const LOW_OUTLIERS = 0.05
// Having the same percentage for slow/fast outliers ensures the `median`
// remains the same.
const HIGH_OUTLIERS = 1 - LOW_OUTLIERS
