// Compute params to send to the measuring sample
export const getParams = function (
  { repeat, repeatLast, sampleLoops },
  { measureDuration },
  { minLoopDuration, targetSampleDuration = TARGET_SAMPLE_DURATION },
) {
  const repeatA = getRepeat(repeat, minLoopDuration)
  const maxLoops = getMaxLoops({
    repeat,
    repeatLast,
    sampleLoops,
    measureDuration,
    targetSampleDuration,
  })
  return { repeat: repeatA, maxLoops }
}

// When estimating `measureCost`, we pass `repeat: 0` to the runner
const getRepeat = function (repeat, minLoopDuration) {
  return minLoopDuration === 0 ? 0 : repeat
}

// `maxLoops` is the number of `repeat` loops the sample should measure.
// Each sample needs to perform a specific amount of measures (`maxLoops`).
// We do this instead of passing a maximum duration instead because:
//   - It is easier to implement for runner.
//   - It is faster, since it does not require computing a timestamp, which
//     allows running more loops in very fast tasks.
//   - It can be used to prevent memory crash in runners.
// The `maxLoops` is computed so the sample lasts a specific duration. We use a
// hardcoded duration because:
//   - It should be as high as possible. Since the upper limit is based on
//     user-perceived duration (preview refresh rate, duration to stop, etc.),
//     we do not need machine-friendly automated durations.
//   - It ensures each sample has roughly the same duration.
//      - This is because some runtime optimization applies as a new sample is
//        run. We do not want this runtime to spread differently between samples
//        due to different durations.
// We use the same target duration whether calibrated or not
//   - This ensures the calibration samples are measured in the same settings
//     as the others. Otherwise, the first samples after calibration might be
//     different from the others, removing the benefits of calibration.
// Since `maxLoops` aims to last a specific duration, we need the last
// `measureDuration` to estimate it.
//   - If the `repeat` changes, we need to take it into account as well, which
//     is especially important during calibration.
const getMaxLoops = function ({
  repeat,
  repeatLast,
  sampleLoops,
  measureDuration,
  targetSampleDuration,
}) {
  // First sample of the benchmark
  if (measureDuration === undefined) {
    return 1
  }

  const repeatGrowth = repeat / repeatLast
  const measureDurationPerLoop = measureDuration / sampleLoops
  return Math.ceil(
    targetSampleDuration / (measureDurationPerLoop * repeatGrowth),
  )
}

// Higher value leads to:
//   - Less frequent previews
//   - Longer to wait for combinations to stop when user requests it.
//       - The sample duration should always be less than the abort delay.
//   - Higher minimum duration for any combination
//   - More unnecessary measures once the `precision` threshold has been reached
//   - Longer time to calibrate
// Lower value leads to:
//   - Higher `stats.stdev` and `stats.high`. This is because new samples have
//     a small cold start. This is especially true for fast|low-complexity tasks
//   - Less duration measuring as opposed to IPC, runner internal logic, stats
//     computation and preview reporting
//   - Due to the above point, the real sample duration is less close to the
//     target.
// The value does not impact `stats.median` much though.
export const TARGET_SAMPLE_DURATION = 1e8
