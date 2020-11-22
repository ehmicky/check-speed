import { getHistogram } from './histogram.js'
import { getMedian, getMean, getDeviation } from './methods.js'
import { getPercentiles } from './percentiles.js'

// Retrieve statistics from a raw set of benchmark results
// Perform the statistical logic.
// Note that when `repeat > 1`, the distribution of the measured function will
// be modified by the looping process and transformed to a bell shape, even if
// if was not one. This means `percentiles`, `histogram` and `deviation` will
// have a different meaning: they visualize the measurements of the function not
// function itself.
export const getStats = function ({ times, count, processes }) {
  // `count` is the number of times `main()` was called
  // `loops` is the number of benchmark loops
  // `repeat` is the average number of iterations inside those benchmark loops
  const loops = times.length
  const repeat = Math.round(count / loops)

  const {
    min,
    max,
    median,
    percentiles,
    histogram,
    mean,
    deviation,
  } = computeStats(times)

  return {
    median,
    mean,
    min,
    max,
    deviation,
    count,
    loops,
    repeat,
    processes,
    histogram,
    percentiles,
  }
}

const computeStats = function (times) {
  const [min] = times
  const max = times[times.length - 1]

  const median = getMedian(times)
  const percentiles = getPercentiles(times)
  const histogram = getHistogram(times, HISTOGRAM_SIZE)

  const mean = getMean(times)
  const deviation = getDeviation(times, mean)

  return { min, max, median, percentiles, histogram, mean, deviation }
}

const HISTOGRAM_SIZE = 1e2
