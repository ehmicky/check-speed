import stripAnsi from 'strip-ansi'

import { UserError } from '../error/main.js'
import { matchSelector } from '../select/match.js'

import { parseLimits } from './parse.js'

// If any `combination.diff` is too slow compared to the `limit` configuration
// property, we fail.
// Done after reporting.
export const checkLimits = function ({ combinations }, limit) {
  const limitMatchers = parseLimits(limit, combinations)
  const limitErrors = combinations
    .map((combination) =>
      checkCombinationLimits({ combination, limitMatchers }),
    )
    .filter(Boolean)

  if (limitErrors.length === 0) {
    return
  }

  const limitError = limitErrors.join('\n')
  throw new UserError(limitError)
}

const checkCombinationLimits = function ({
  combination,
  combination: {
    name,
    stats: { diff },
  },
  limits,
}) {
  if (diff === undefined) {
    return
  }

  const limit = limits.find(({ selector }) =>
    matchSelector(combination, selector),
  )

  if (limit === undefined) {
    return
  }

  const { percentage } = limit

  if (diff <= percentage) {
    return
  }

  return getLimitError(name, diff, percentage)
}

const getLimitError = function (name, diff, percentage) {
  const nameA = stripAnsi(name)
  const diffStr = serializeDiff(diff)
  return `${nameA} should be at most ${percentage}% slower but is ${diffStr}% slower`
}

const serializeDiff = function (diff) {
  const percentage = diff * PERCENTAGE_RATIO
  return percentage
    .toPrecision(PERCENTAGE_PRECISION)
    .replace(ONLY_ZEROS_REGEXP, '')
    .replace(TRAILING_ZEROS_REGEXP, '$1')
}

const PERCENTAGE_RATIO = 1e2
const PERCENTAGE_PRECISION = 2
const ONLY_ZEROS_REGEXP = /\.0+/gu
const TRAILING_ZEROS_REGEXP = /(\.\d*)0+$/gu