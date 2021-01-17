import { aggregateMeasures } from './aggregate.js'
import { getMeasureDuration } from './measure_duration.js'
import { getRepeat } from './repeat.js'
import { repeatInitReset, getRepeatInit } from './repeat_init.js'

// Handle return value from the last sample
// eslint-disable-next-line max-statements, max-lines-per-function
export const handleReturnValue = function (
  {
    measures,
    bufferedMeasures,
    samples,
    loops,
    times,
    repeat,
    repeatInit,
    minLoopDuration,
    stats,
    aggregateCountdown,
    sampleDurationLast,
    measureDurationLast,
    measureDurations,
  },
  { mainMeasures },
) {
  if (mainMeasures === undefined) {
    return {}
  }

  const [
    measuresA,
    bufferedMeasuresA,
    measureDurationsA,
    samplesA,
    loopsA,
    timesA,
  ] = repeatInitReset({
    repeatInit,
    measures,
    bufferedMeasures,
    measureDurations,
    samples,
    loops,
    times,
  })

  const samplesB = samplesA + 1
  const newLoops = mainMeasures.length
  const loopsB = loopsA + newLoops
  const timesB = timesA + newLoops * repeat

  const measureDuration = getMeasureDuration(
    measureDurationsA,
    measureDurationLast,
    newLoops,
  )

  const bufferedMeasuresB = [...bufferedMeasuresA, { mainMeasures, repeat }]
  const [
    measuresB,
    bufferedMeasuresC,
    statsA,
    aggregateCountdownA,
  ] = aggregateMeasures({
    measures: measuresA,
    bufferedMeasures: bufferedMeasuresB,
    stats,
    aggregateCountdown,
    sampleDurationLast,
    repeatInit,
  })

  const repeatA = getRepeat({ repeat, stats: statsA, minLoopDuration })
  const repeatInitA = getRepeatInit({ repeatInit, repeat, newRepeat: repeatA })

  return {
    measures: measuresB,
    bufferedMeasures: bufferedMeasuresC,
    samples: samplesB,
    loops: loopsB,
    times: timesB,
    repeat: repeatA,
    repeatInit: repeatInitA,
    stats: statsA,
    aggregateCountdown: aggregateCountdownA,
    measureDurations: measureDurationsA,
    measureDuration,
  }
}
