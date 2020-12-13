import { getHistogram } from './histogram.js'
import { getMin, getMax } from './min_max.js'
import { getNonOutliersLength, OUTLIERS_THRESHOLD } from './outliers.js'
import { getSortedMedian, getQuantiles } from './quantile.js'
import { getMean, getDeviation } from './sum.js'

// Retrieve statistics from results.
// Perform the statistical logic.
// Note that when `repeat > 1`, the distribution of the measured function will
// be modified by the looping process and transformed to a bell shape, even if
// if was not one. This means `quantiles`, `histogram` and `deviation` will
// have a different meaning: they visualize the measurements of the function not
// function itself.
export const getStats = function ({
  measures,
  processes,
  loops,
  times,
  minLoopDuration,
  loadCost,
}) {
  const {
    loops: loopsA,
    repeat,
    times: timesA,
    min,
    max,
    median,
    quantiles,
    histogram,
    mean,
    deviation,
  } = computeStats(measures, loops, times)

  return {
    median,
    mean,
    min,
    max,
    deviation,
    loops: loopsA,
    times: timesA,
    repeat,
    processes,
    histogram,
    quantiles,
    minLoopDuration,
    loadCost,
  }
}

// eslint-disable-next-line max-statements
const computeStats = function (measures, loops, times) {
  // `times` is the number of times `main()` was called
  // `loops` is the number of repeat loops
  // `repeat` is the average number of iterations inside those repeat loops
  const loopsA = getNonOutliersLength(loops, OUTLIERS_THRESHOLD)
  const timesA = getNonOutliersLength(times, OUTLIERS_THRESHOLD)
  const repeat = Math.round(timesA / loopsA)

  const min = getMin(measures)
  const max = getMax(measures, OUTLIERS_THRESHOLD)

  const median = getSortedMedian(measures, OUTLIERS_THRESHOLD)
  const quantiles = getQuantiles(measures, QUANTILES_SIZE, OUTLIERS_THRESHOLD)
  const histogram = getHistogram(measures, HISTOGRAM_SIZE, OUTLIERS_THRESHOLD)

  const mean = getMean(measures, OUTLIERS_THRESHOLD)
  const deviation = getDeviation(measures, mean, OUTLIERS_THRESHOLD)

  return {
    loops: loopsA,
    times: timesA,
    repeat,
    min,
    max,
    median,
    quantiles,
    histogram,
    mean,
    deviation,
  }
}

const QUANTILES_SIZE = 1e2
const HISTOGRAM_SIZE = 1e2
