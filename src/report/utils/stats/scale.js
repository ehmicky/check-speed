// Divide stats by a scale so they don't show too many digits nor decimals.
export const getScale = function (allCombinations, name, kind) {
  const measures = allCombinations
    .map((combination) => getMeasure(combination, name, kind))
    .filter(isNotEmpty)

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
// `median` is `undefined` when `showPrecision: false`
// `medianLow` is `undefined` when number of loops is low
const getMeasure = function ({ stats }, name, kind) {
  if (!MEDIAN_KINS.has(kind)) {
    return stats[name].raw
  }

  if (stats.median.raw !== undefined) {
    return stats.median.raw
  }

  if (stats.medianLow.raw !== undefined) {
    return stats.medianLow.raw
  }

  return stats.mean.raw
}

const MEDIAN_KINS = new Set(['duration'])

// Zero measures sometimes indicate a problem with the measure, so are not
// good indicators for scales.
// `undefined` happens in preview mode if not-measured-yet.
const isNotEmpty = function (measure) {
  return measure !== 0 && measure !== undefined
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
  // Percentages per-mil and per-myriad Unicode signs do not show well on
  // terminals. Units like "pcm" are not well-known. So we always use % instead.
  // We do not use the exponent notation because it is odd to combine it with %.
  percentage: [1e-2],
}
/* eslint-enable no-magic-numbers */
