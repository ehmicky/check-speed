import { getTvalue } from './tvalue.js'

// Retrieve margin of error, relative to the median
// The standard error:
//  - Is the standard deviation that would be obtained by repeating the same
//    benchmark
//  - This is providing the underlying distribution remained the same. In
//    practice, there is always a variation due to the environment. So it is
//    more accurately described as the maximum difference between the current
//    median and the future median if we kept measuring forever.
//  - In other terms, it measures the precision of the current median, but not
//    the potential variation with the next median
//     - I.e. this does not measure the possible range of median in future
//       measures
//     - For example, variation might come from the environment (such as machine
//       load)
// The margin of error:
//  - Computes a range around the median where there is 95% of probability that
//    the real median (if we kept measuring forever) would fall.
//  - It uses time duration, which is easier when considering a single
//    combination precision
// The moe is meant to be reported:
//  - by median-focused reporters (not distribution-focused)
//  - either graphically (stats.moe) or as a duration (stats.moePretty)
// The moe is useful:
//  - both for:
//     - reporting each combination's precision
//     - knowing if two combinations are comparable, by checking if their moe
//       overlaps
//        - this is statistically imperfect, i.e. just an approximation
//        - the proper way would be to use a welch's t-test
//  - for those reasons, using the moe as an absolute duration is more useful in
//    reporting than using the moe relative to the median (percentage)
// This all relies on measures following a normal distribution
//  - In practice, this is rarely the case:
//     - Several distributions are usually summed, i.e. producing several modes.
//       For example, if a background process (like garbage collection) operates
//       at regular intervals, it will add its own distribution.
//     - Distributions tend to be lognormal, with a longer tail for slow
//       durations
//  - However, this is fine for practical purpose:
//     - This is close enough to a normal distribution to be useful, while not
//       being completely statistically correct
//     - Removing the slow|fast outliers helps getting closer to a normal
//       distribution
export const getMoe = function (array, stdev) {
  if (stdev === undefined) {
    return
  }

  const { length } = array
  const standardError = stdev / Math.sqrt(length)
  const tvalue = getTvalue(length)
  const marginOfError = standardError * tvalue
  return marginOfError
}