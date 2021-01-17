import { aggregateMeasures } from './aggregate.js'
import { getMeasureDuration } from './measure_duration.js'
import { normalizeSampleMeasures } from './normalize.js'
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
  { measures: sampleMeasures },
) {
  if (sampleMeasures === undefined) {
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
  const newLoops = sampleMeasures.length
  const loopsB = loopsA + newLoops
  const timesB = timesA + newLoops * repeat

  const measureDuration = getMeasureDuration(
    measureDurationsA,
    measureDurationLast,
    newLoops,
  )

  const {
    sampleMeasures: sampleMeasuresA,
    sampleMedian,
  } = normalizeSampleMeasures(sampleMeasures, repeat)
  const [
    measuresB,
    bufferedMeasuresB,
    statsA,
    aggregateCountdownA,
  ] = aggregateMeasures({
    measures: measuresA,
    bufferedMeasures: bufferedMeasuresA,
    sampleMeasures: sampleMeasuresA,
    stats,
    aggregateCountdown,
    sampleDurationLast,
    repeatInit,
  })

  const newRepeat = getRepeat({ repeat, sampleMedian, minLoopDuration })
  const repeatInitA = getRepeatInit({ repeatInit, repeat, newRepeat })

  return {
    measures: measuresB,
    bufferedMeasures: bufferedMeasuresB,
    samples: samplesB,
    loops: loopsB,
    times: timesB,
    repeat: newRepeat,
    repeatInit: repeatInitA,
    stats: statsA,
    aggregateCountdown: aggregateCountdownA,
    measureDurations: measureDurationsA,
    measureDuration,
  }
}
