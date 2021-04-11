import now from 'precise-now'

// Retrieve initial `durationState`
export const getInitialDurationState = function () {
  return { totalDuration: 0 }
}

// We keep track of:
//  - The total duration spent on each combination, to know whether it should
//    keep being measured.
//  - The mean duration of a sample, to know whether measuring an additional
//    sample would fit within the allowed `duration`
export const startSample = function (stopState, { sampleDurationMean }) {
  const sampleStart = now()
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(stopState, { sampleStart, sampleDurationMean })
  return sampleStart
}

export const endSample = function ({
  durationState: { totalDuration },
  sampleState: { allSamples },
  sampleStart,
  stopState,
  measureDuration,
}) {
  // eslint-disable-next-line fp/no-delete, no-param-reassign
  delete stopState.sampleStart
  // eslint-disable-next-line fp/no-delete, no-param-reassign
  delete stopState.sampleDurationMean

  const sampleDurationLast = now() - sampleStart
  const totalDurationA = totalDuration + sampleDurationLast
  const sampleDurationMean = totalDurationA / allSamples
  return { totalDuration: totalDurationA, sampleDurationMean, measureDuration }
}
