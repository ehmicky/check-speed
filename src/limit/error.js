import stripAnsi from 'strip-ansi'

import { UserError } from '../error/main.js'

// Add `combination.slowError`
export const getSlowError = function ({ slow, name, limitPercentage, diff }) {
  if (!slow) {
    return
  }

  const nameA = stripAnsi(name)
  const diffStr = serializePercentage(diff * PERCENTAGE_RATIO)
  return `${nameA} should be at most ${limitPercentage}% slower but is ${diffStr}% slower`
}

const serializePercentage = function (percentage) {
  return percentage
    .toPrecision(PERCENTAGE_PRECISION)
    .replace(ONLY_ZEROS_REGEXP, '')
    .replace(TRAILING_ZEROS_REGEXP, '$1')
}

const PERCENTAGE_RATIO = 1e2
const PERCENTAGE_PRECISION = 2
const ONLY_ZEROS_REGEXP = /\.0+/gu
const TRAILING_ZEROS_REGEXP = /(\.\d*)0+$/gu

// If any `combination.slowError` is set, we throw them.
// We do it after reporting.
export const checkLimits = function ({ combinations }) {
  const limitError = combinations
    .map(getSlowErrorField)
    .filter(Boolean)
    .join('\n')

  if (limitError === '') {
    return
  }

  throw new UserError(limitError)
}

const getSlowErrorField = function ({ slowError }) {
  return slowError
}
