import stringWidth from 'string-width'

import { fieldColor } from '../../utils/colors.js'
import { COLUMN_SEPARATOR } from '../../utils/separator.js'
import { STAT_TITLES } from '../../utils/stat_titles.js'
import { getCombinationName } from '../../utils/title.js'

import { NAME_RIGHT_PADDING_WIDTH } from './row.js'

// Retrieve the header row
export const getHeader = function ({ titles, stats }, columns, columnWidth) {
  const emptyRowName = ' '.repeat(getEmptyRowWidth(titles))
  const headerCells = getHeaderCells(stats, columns, columnWidth)
  return `${emptyRowName}${headerCells}`
}

export const getEmptyRowWidth = function (titles) {
  return stringWidth(getCombinationName(titles)) + NAME_RIGHT_PADDING_WIDTH
}

const getHeaderCells = function (stats, columns, columnWidth) {
  return columns
    .map((column) => getHeaderCell(stats, column, columnWidth))
    .join(COLUMN_SEPARATOR)
}

// Retrieve a cell in the header row
const getHeaderCell = function (stats, column, columnWidth) {
  const headerName = getHeaderName(column).padStart(columnWidth)
  return fieldColor(headerName)
}

export const getHeaderName = function (column) {
  return STAT_TITLES[column]
}
