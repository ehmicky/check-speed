import { addSuffixColors, addDiffColors } from './colors.js'
import { getStatsDecimals } from './decimals.js'
import { STAT_KINDS } from './kinds.js'
import { getPadding, padValue } from './padding.js'
import { getScale } from './scale.js'
import { serializeStat } from './serialize.js'

// Add `combination.stats.*Pretty` which is like `combination.stats.*` but
// serialized and CLI-reporter-friendly. It adds time units, rounding, padding
// and ensures proper vertical alignment.
export const prettifyStats = function (combinations) {
  return STAT_KINDS.reduce(prettifyCombinationsStat, combinations)
}

const prettifyCombinationsStat = function (combinations, { name, kind }) {
  const prettyName = `${name}Pretty`
  const scale = getScale(combinations, name, kind)
  const decimals = getStatsDecimals(combinations, name, scale)
  const combinationsA = combinations.map((combination) =>
    prettifyCombinationStat({
      combination,
      name,
      prettyName,
      kind,
      scale,
      decimals,
    }),
  )
  const padding = getPadding(prettyName, combinationsA)
  const combinationsB = combinationsA.map((combination) =>
    finalizeValue({ combination, name, prettyName, padding }),
  )
  return combinationsB
}

const prettifyCombinationStat = function ({
  name,
  prettyName,
  combination,
  combination: {
    stats,
    stats: { [name]: stat },
  },
  kind,
  scale,
  decimals,
}) {
  const statPretty = serializeStat({ stat, kind, scale, decimals })
  return { ...combination, stats: { ...stats, [prettyName]: statPretty } }
}

// Add paddings and colors after stats have been prettified
// We pad after values length for each combination is known.
// We pad before adding colors because ANSI sequences makes padding harder.
const finalizeValue = function ({
  name,
  prettyName,
  combination,
  combination: {
    stats,
    stats: { [name]: stat, [prettyName]: statPretty },
  },
  padding,
}) {
  const { statPretty: statPrettyA, statPrettyPadded } = finalizeStat({
    stat,
    statPretty,
    name,
    padding,
  })
  return {
    ...combination,
    stats: {
      ...stats,
      [prettyName]: statPrettyA,
      [`${prettyName}Padded`]: statPrettyPadded,
    },
  }
}

const finalizeStat = function ({ stat, statPretty, name, padding }) {
  if (!Array.isArray(stat)) {
    const singleStatPretty = finalizeItem(stat, statPretty, name)
    const singleStatPadded = padValue(singleStatPretty, padding)
    return { statPretty: singleStatPretty, statPrettyPadded: singleStatPadded }
  }

  const statPrettyA = stat.map((statA, index) =>
    finalizeItem(statA, statPretty[index], name),
  )
  const statPrettyPadded = statPrettyA.map((statPrettyB) =>
    padValue(statPrettyB, padding),
  )
  return { statPretty: statPrettyA, statPrettyPadded }
}

const finalizeItem = function (stat, statPretty, name) {
  const statPrettyA = addSuffixColors(statPretty)
  const statPrettyB = addDiffColors(stat, statPrettyA, name)
  return statPrettyB
}
