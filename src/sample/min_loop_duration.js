import { getMediansMedian } from '../stats/median.js'

import { getResolution } from './resolution.js'

// `measureCost` is the time taken to take a measurement.
// This includes the time to get the start/end timestamps for example.
// In order to minimize the impact of `measureCost` on measures:
//  - We run batches of measures at a time in a loop
//  - The `repeat` size of that loop is automatically guessed
//  - No loop is used if the task is too slow to be impacted by `measureCost`
// Some runners take a long time to call each task, e.g. by spawning processes:
//  - Those should not use any `repeat` loop, since that is meant to remove the
//    time to take timestamps, not the time to spawn processes.
//  - Also, `measureCost` would be too large, creating very large `repeat`.
//  - Those use `runner.repeat: false`, making them not use any `repeat` loop.
// Iterating the `repeat` loop adds a small duration, due to the time to
// increment the loop counter (e.g. 1 or 2 CPU cycles)
//  - We do not subtract that duration because it is variable, so would lower
//    the overall precision.
//  - Also measuring that duration is imperfect, which also lowers precision
//  - Moreover, estimating that duration takes time and adds complexity
// Runners should minimize that loop counter duration. Using a simple "for" loop
// should be enough. Loop unrolling is an option but is tricky to get right and
// is probably not worth the effort:
//  - Functions with large loop unrolling might be deoptimized by compilers and
//    runtimes, or even hit memory limits. For example, in JavaScript, functions
//    with a few hundred statements are deoptimized. Also, `new Function()` body
//    has a max size.
//  - Parsing (as opposed to executing) the unrolled code should not be
//    measured. For example, in JavaScript, `new Function()` should be used,
//    not `eval()`.
// Calling each task also adds a small duration due to the time it takes to
// create a new function stack:
//  - However, this duration is experienced by end users, so should be kept
//  - Inlining could be used to remove this, but it is hard to implement:
//     - The logic can be short-circuited if the task uses things like `return`
//     - The task might contain reference to outer scopes (with lexical
//       scoping), which would be broken by inlining
//  - Estimating that duration is hard since compilers/runtimes would typically
//    remove that function stack when trying to benchmark an empty task
// Not using loop unrolling nor subtracting `measureCost` nor the time to
// iterate the `repeat` loop is better for precision, but worse for accuracy
// (this is tradeoff).
// Very fast functions might be optimized by compilers/runtimes:
//  - For example, simple tasks like `1 + 1` are often simply not executed
//  - Tricks like returning a value or assigning variables sometimes help
//    avoiding this
//  - The best way to benchmark those very fast functions is to increase their
//    complexity. Since the runner already runs those in a "for" loop, the only
//    thing that a task should do is increase the size of its inputs.
export const getMinLoopDuration = function ({
  minLoopDuration,
  measureCosts,
  resolution,
  resolutionSize,
  emptyMeasures,
  empty,
}) {
  if (!empty) {
    return [minLoopDuration, measureCosts, resolution, resolutionSize]
  }

  const measureCost = getMeasureCost(measureCosts, emptyMeasures)
  const minMeasureCostDuration = measureCost * MIN_MEASURE_COST
  const [newResolution, newResolutionSize] = getResolution(
    resolution,
    resolutionSize,
    emptyMeasures,
  )
  const minResolutionDuration = newResolution * MIN_RESOLUTION_PRECISION
  const newMinLoopDuration = Math.max(
    minResolutionDuration,
    minMeasureCostDuration,
  )
  return [newMinLoopDuration, measureCosts, newResolution, newResolutionSize]
}

// This function estimates `measureCost` by making runners measure empty tasks.
// That cost must be computed separately for each combination since they might
// vary depending on the task, input or system. For example, tasks with more
// iterations per sample have more time to optimize `measureCost`, which is
// usually faster then.
const getMeasureCost = function (measureCosts, emptyMeasures) {
  return getMediansMedian({
    medians: measureCosts,
    array: emptyMeasures,
    precision: EMPTY_MEASURES_PRECISION,
  })
}

const EMPTY_MEASURES_PRECISION = 1e2

// How many times slower each repeat loop iteration must be compared to
// `measureCost`.
// Ensure `repeat` is high enough to decrease the impact of `measureCost`.
// A lower value decreases precision as the lack of precision of `measureCost`
// contributes more to the overall lack of precision.
// A higher value increases the task loop duration, creating fewer loops.
const MIN_MEASURE_COST = 1e2
// How many times slower the repeated median must be compared to the resolution.
// A lower value makes measures closer to the resolution, making them less
// precise.
// A higher value increases the task loop duration, creating fewer loops.
const MIN_RESOLUTION_PRECISION = 1e2

// This function returns whether the runner should measure empty tasks.
// This is needed in order to compute `measureCost`.
// This is only needed when the `repeat` loop is used:
//  - When `repeat` is not `1`
//  - However, when `runnerInit` is `true`, `repeat` might be `1` due to not
//    being callibrated yet.
//  - When `runner.repeat` is `false`, `empty` is always `undefined` and runner
//    should not compute empty tasks.
// If `empty` is `true`, the runner should return `emptyMeasures`:
//   - Before each `measure`, the runner should measure an `emptyMeasure`
//   - An `emptyMeasure` is like a `measure` but without:
//      - `beforeEach` and `afterEach`
//      - Executing any task
//      - Iterating any loop
//   - For example, an `emptyMeasure` might only retrieve timestamps and compute
//     their difference
// This is done inside each sample. We do not:
//   - Run this in a separate phase, before any measurement takes place. Doing
//     both the main measurement and the `measureCost` callibration at the same
//     time allows the latter to last longer (and be more precise) as the
//     `duration` is increased.
//   - Run this in the runner, before or after the main measuring loop. Instead,
//     we run this alongside it
//      - This is because the time to retrieve timestamps often gets faster and
//        faster, as more iterations are run and the runtime optimize hot paths.
//        Measuring it alongside is the only way to measure it accurately. It is
//        also much more precise.
//      - This also allows using the same `maxLoops`
//      - As a small bonus, this also provides with a small cold start for the
//        main measuring loop
//      - However, the function measuring `emptyMeasures` and `measures` should
//        be different. Otherwise, each `emptyMeasure` would de-optimize
//        the main task `measures`, making it slower.
export const getEmpty = function (repeat, repeatInit, runnerRepeats) {
  if (!runnerRepeats) {
    return
  }

  return repeat !== 1 || repeatInit
}
