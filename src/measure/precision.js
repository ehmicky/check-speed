import { UserError } from '../error/main.js'

// Replaces `precision` configuration property by `precisionTarget`.
// Also validates it.
// For each of those `precision` values, each combination stops once its `rmoe`
// reached the corresponding `precisionTarget`.
// There are several advantages in using `precision` instead of a `duration`:
//  - A `duration` makes the precision (`rmoe`) machine-dependent or
//    hardward load-dependent
//     - This problem would be lessened (but not removed) by slower tasks
//       tending to have lower stdev
//  - Two combinations with same `rmoe` (than with same `duration`) are more
//    statically comparable
//  - This makes the results independent from the duration to start or end
//    the task.
//     - Otherwise the task's number of samples would be influenced by adding
//       more `import` for example.
//     - Note: if a `duration` was used instead, this could also be solved by
//       excluding start|end
//  - This makes each combination results independent from each other
//     - Adding/removing combinations should not change the duration/results of
//       others
//        - This includes using the `include|exclude` configuration properties
//     - Note: if a `duration` was used instead, this could also be solved by
//       making it combination-specific
// We only optimize the `rmoe` of the current combination in the current run.
//  - We do not try to maximize the precision of comparing either:
//     - With a previous result of the same combination (`stats.diff`)
//     - With other combinations in the same run (e.g. with Mann-Whitney U-test)
//  - This is because:
//     - Combinations being too close to be compared is interesting in itself,
//       since this indicates to user that they are not comparable
//     - At that level of closeness, measuring longer to know which one is
//       faster is too influenced by environment variation
//     - In a perfect environment, if the combinations are identical, they would
//       always be too close to stop measuring.
//     - This allows computing `precision` independently in each combination
export const normalizePrecision = function (precision, name) {
  if (!Number.isInteger(precision)) {
    throw new UserError(`'${name}' must be a positive integer: ${precision}`)
  }

  const precisionTarget = PRECISION_TARGETS[precision]

  if (precisionTarget === undefined) {
    throw new UserError(
      `'${name}' must be between ${MIN_PRECISION} and ${MAX_PRECISION}, not ${precision}`,
    )
  }

  return { precisionTarget }
}

// Associates `precision` (using array index) to the minimum `rmoe` each
// combination must reach.
// We use a limited number of levels to represent "medium"/"high"/"very high"
// levels on each side (2/1/0 for speed and 2/3/4 for precision).
// eslint-disable-next-line no-magic-numbers
const PRECISION_TARGETS = [0, 5e-2, 1e-2, 5e-3, 1e-3]
const MIN_PRECISION = 0
const MAX_PRECISION = PRECISION_TARGETS.length - 1

// When there are not enough loops, the `stdev` is too imprecise so we leave it
// `undefined`.
// This applies to all derived stats, including `rmoe`.
// This means:
//  - Any benchmark must run a minimum amount:
//     - This prevents against early exits due to imprecise `stdev` at the
//       beginning
//     - This ensures cold starts do not impact median too much
//     - Exception: when using `precision: 0`
//  - Until reaching that threshold:
//     - The following are not reported:
//        - `stdev` and related stats
//        - Preview `durationLeft`
//     - This also means those are never reported if `precision: 0`
export const isPreciseEnough = function (rmoe, precisionTarget) {
  return rmoe !== undefined && rmoe <= precisionTarget
}