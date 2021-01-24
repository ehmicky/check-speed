// Divide stats by a scale so they don't show too many digits nor decimals.
export const getScale = function (combinations, name, kind) {
  const measures = combinations
    .map((combination) => getMeasure(combination, name, kind))
    .filter(isNotZero)

  if (measures.length === 0) {
    return 1
  }

  const scales = SCALES[kind]
  const minMeasure = Math.min(...measures)
  const scaleA = scales.find((scale) => minMeasure >= scale)

  if (scaleA === undefined) {
    return scales[scales.length - 1]
  }

  return scaleA
}

// The same duration scale is used for all `stats.*Pretty` to make it easier to
// compare between them.
const getMeasure = function ({ stats }, name, kind) {
  if (kind === 'duration') {
    return stats.median
  }

  return stats[name]
}

// Zero measures sometimes indicate a problem with the measure, so are not
// good indicators for scales.
const isNotZero = function (measure) {
  return measure !== 0
}

// Possible scales for each unit kind.
/* eslint-disable no-magic-numbers */
const SCALES = {
  // The maximum scale is seconds:
  //  - minutes require writing two scales (e.g. 1m56s) which is harder to read
  //  - minutes are not base 10 which makes it harder to visually compare
  //  - hours-long tasks are unlikely
  duration: [1e9, 1e6, 1e3, 1, 1e-3, 1e-6],
  // Counts use exponential exponents and avoid decimals.
  count: [1e15, 1e12, 1e9, 1e6, 1e3, 1, 1e-3, 1e-6, 1e-9, 1e-12, 1e-15],
  // For the moment, percentages are always shown as integers
  relativePercentage: [1e2],
  absolutePercentage: [1e2],
}
/* eslint-enable no-magic-numbers */