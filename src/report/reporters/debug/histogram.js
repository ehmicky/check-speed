/* eslint-disable max-lines, max-statements */
import stringWidth from 'string-width'

import { getScreenWidth } from '../../tty.js'

export const getHistograms = function (combinations) {
  return combinations.map(getHistogram)
}

const getHistogram = function ({
  stats: { histogram, min, minPretty, median, medianPretty, max, maxPretty },
}) {
  if (histogram === undefined) {
    return
  }

  const minPrettyA = minPretty.trim()
  const medianPrettyA = medianPretty.trim()
  const maxPrettyA = maxPretty.trim()

  const width = getScreenWidth() - OUTSIDE_LEFT_PADDING - OUTSIDE_RIGHT_PADDING
  const contentWidth = width - CONTENT_LEFT_PADDING - CONTENT_RIGHT_PADDING
  const frequencies = histogram.map(([, , frequency]) => frequency)
  const maxFrequency = Math.max(...frequencies)
  const medianPercentage = (median - min) / (max - min)
  const medianIndex = Math.round((contentWidth - 1) * medianPercentage)

  const rows = Array.from({ length: HISTOGRAM_HEIGHT }, (_, index) =>
    getHistogramRow(index, contentWidth),
  ).join('\n')
  const bottomLine = getBottomLine(width, medianIndex)
  const abscissa = getAbscissa({
    minPretty: minPrettyA,
    maxPretty: maxPrettyA,
    width,
    medianIndex,
    medianPretty: medianPrettyA,
  })
  return `${rows}
${bottomLine}
${abscissa}`
}

const HISTOGRAM_HEIGHT = 8
const HISTOGRAM_CHARS = [
  ' ',
  '\u2581',
  '\u2582',
  '\u2583',
  '\u2584',
  '\u2585',
  '\u2586',
  '\u2587',
  '\u2588',
]
const HORIZONTAL_LINE = '\u2500'
const TICK_LEFT = '\u250C'
const TICK_MIDDLE = '\u252C'
const TICK_RIGHT = '\u2510'
const OUTSIDE_LEFT_PADDING = 1
const OUTSIDE_RIGHT_PADDING = 1
const CONTENT_LEFT_PADDING = 1
const CONTENT_RIGHT_PADDING = 1
const MEDIAN_PADDING = 1

const getHistogramRow = function (index, contentWidth) {
  const contentLeftPadding = ' '.repeat(CONTENT_LEFT_PADDING)
  const contentRightPadding = ' '.repeat(CONTENT_RIGHT_PADDING)
  const row = 'o'.repeat(contentWidth)
  return `${contentLeftPadding}${row}${contentRightPadding}`
}

const getBottomLine = function (width, medianIndex) {
  const rightLineWidth =
    width -
    medianIndex -
    TICK_LEFT.length -
    TICK_MIDDLE.length -
    TICK_RIGHT.length
  const leftLine = HORIZONTAL_LINE.repeat(medianIndex)
  const rightLine = HORIZONTAL_LINE.repeat(rightLineWidth)
  return `${TICK_LEFT}${leftLine}${TICK_MIDDLE}${rightLine}${TICK_RIGHT}`
}

const getAbscissa = function ({
  minPretty,
  maxPretty,
  width,
  medianIndex,
  medianPretty,
}) {
  const minPrettyWidth = stringWidth(minPretty)
  const medianPrettyWidth = stringWidth(medianPretty)
  const maxPrettyWidth = stringWidth(maxPretty)
  const medianPaddedIndex = medianIndex + CONTENT_LEFT_PADDING
  const medianBelow =
    medianPaddedIndex < minPrettyWidth + MEDIAN_PADDING ||
    medianPaddedIndex >
      width - maxPrettyWidth - medianPrettyWidth - MEDIAN_PADDING

  if (medianBelow) {
    const spacesWidth = width - minPrettyWidth - maxPrettyWidth
    const leftSpacesWidth = Math.min(
      medianPaddedIndex,
      width - medianPrettyWidth,
    )
    const rightSpacesWidth = width - leftSpacesWidth - medianPrettyWidth
    const spaces = ' '.repeat(spacesWidth)
    const leftSpaces = ' '.repeat(leftSpacesWidth)
    const rightSpaces = ' '.repeat(rightSpacesWidth)
    return `${minPretty}${spaces}${maxPretty}
${leftSpaces}${medianPretty}${rightSpaces}`
  }

  const leftSpacesWidth = medianPaddedIndex - minPrettyWidth
  const rightSpacesWidth =
    width -
    leftSpacesWidth -
    minPrettyWidth -
    medianPrettyWidth -
    maxPrettyWidth
  const leftSpaces = ' '.repeat(leftSpacesWidth)
  const rightSpaces = ' '.repeat(rightSpacesWidth)
  return `${minPretty}${leftSpaces}${medianPretty}${rightSpaces}${maxPretty}`
}
/* eslint-enable max-lines, max-statements */
