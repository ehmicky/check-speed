import stringWidth from 'string-width'

import { STAT_TYPES } from './types.js'

// Pad `*.statsPretty` on the left so they vertically align.
// Right padding was already performed when setting the number of decimals.
export const addPaddings = function (iterations) {
  return Object.keys(STAT_TYPES).reduce(addStatTypePaddings, iterations)
}

const addStatTypePaddings = function (iterations, name) {
  const padding = getPadding(name, iterations)
  return iterations.map((iteration) => addPadding({ iteration, name, padding }))
}

// Retrieve the maximum length of any measures for each stat
const getPadding = function (name, iterations) {
  const statLengths = iterations
    .flatMap(({ stats }) => stats[`${name}Pretty`])
    .map(stringWidth)

  if (statLengths.length === 0) {
    return 0
  }

  return Math.max(...statLengths)
}

const addPadding = function ({
  iteration,
  iteration: { stats },
  name,
  padding,
}) {
  const prettyName = `${name}Pretty`
  const prettyStat = padValue(stats[prettyName], padding)
  return { ...iteration, stats: { ...stats, [prettyName]: prettyStat } }
}

const padValue = function (stat, padding) {
  if (Array.isArray(stat)) {
    return stat.map((statA) => coloredPad(statA, padding))
  }

  return coloredPad(stat, padding)
}

// Pad that takes into account ANSI color sequences
const coloredPad = function (stat, padding) {
  const ansiLength = stat.length - stringWidth(stat)
  return stat.padStart(padding + ansiLength)
}