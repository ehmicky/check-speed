import { combinationHasErrored } from '../error/combination.js'

// Filters out any combinations with no `duration` left
// We ensure each combination is measured at least once by checking
// `sampleDurationMean === undefined`.
// We do not time out combinations even when slower than the `duration`
// configuration property:
//  - Timing out requires killing process, which might skip some resources
//    cleanup (afterEach and afterAll)
//  - The `duration` might be adjusted for a specific machine that is faster
//    than others. This might make slower machines time out.
//  - This allows `duration: 1` to be used to measure each combination once
// Combination durations does not include the duration spent starting, ending
// nor exiting them because:
//  - Adding imports to a task should not change the task's number of samples
//  - Adding slow-to-start tasks should not change other tasks number of samples
export const getRemainingCombinations = function ({
  combinations,
  duration,
  exec,
  stopState,
}) {
  if (shouldEndMeasuring(combinations, stopState)) {
    return []
  }

  const combinationMaxLoops = getCombinationMaxLoops(combinations)
  return combinations.filter((combination) =>
    isRemainingCombination({
      combination,
      duration,
      exec,
      combinationMaxLoops,
    }),
  )
}

// When any combination errors, we end measuring.
// We also do this when the user stopped the benchmark (e.g. with CTRL-C).
// We still perform each combination ends and exits, for cleanup.
const shouldEndMeasuring = function (combinations, { stopped }) {
  return stopped || combinations.some(combinationHasErrored)
}

const getCombinationMaxLoops = function (combinations) {
  return Math.ceil(MAX_LOOPS / combinations.length)
}

// We end running samples when the `measures` is over `MAX_LOOPS`. This
// is meant to prevent memory overflow.
// The default limit for V8 in Node.js is 1.7GB, which allows measures to hold a
// little more than 1e8 floats.
const MAX_LOOPS = 1e8

// With the `exec` command, we run each combination exactly once, even if
// not calibrated.
const isRemainingCombination = function ({
  combination: {
    totalDuration,
    sampleDurationMean,
    sampleMedian,
    minLoopDuration,
    loops,
    calibrated,
  },
  duration,
  exec,
  combinationMaxLoops,
}) {
  return (
    loops === 0 ||
    (loops < combinationMaxLoops &&
      !exec &&
      hasTimeLeft({
        duration,
        sampleDurationMean,
        sampleMedian,
        minLoopDuration,
        totalDuration,
        calibrated,
      }))
  )
}

const hasTimeLeft = function ({
  duration,
  sampleDurationMean,
  sampleMedian,
  minLoopDuration,
  totalDuration,
  calibrated,
}) {
  if (duration === 1) {
    return hasFastTimeLeft({ sampleMedian, minLoopDuration, calibrated })
  }

  return duration === 0 || totalDuration + sampleDurationMean < duration
}

// When `duration` is `1`, we run the combination only once.
// But if the combination is calibrating, we wait for calibration.
// This includes removing the cold start.
// However, we do not remove the cold start for slow combinations since the user
// would be able to perceive that the combination has run twice.
const hasFastTimeLeft = function ({
  sampleMedian,
  minLoopDuration,
  calibrated,
}) {
  return !calibrated && sampleMedian < minLoopDuration * FAST_MODE_MIN_RATE
}

// Combinations with a first duration slower than this will stop right away,
// i.e. their cold start will be reported.
// We decide what a slow combination is by using a multiple of
// `minLoopDuration`. This allows not relying on hardcoded durations, making it
// work on machines of all speed. Also, this ensures that we are not skipping
// a `repeat` calibration due to a cold start.
// If the runner does not support repeat loops, `minLoopDuration` will be 0,
// i.e. cold start will always be included.
const FAST_MODE_MIN_RATE = 1e2