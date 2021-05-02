import stringWidth from 'string-width'

import { fieldColor } from '../../utils/colors.js'
import { COLUMN_SEPARATOR } from '../../utils/separator.js'
import { STAT_TITLES } from '../../utils/stat_titles.js'
import { getCombinationName } from '../../utils/title.js'

import { NAME_RIGHT_PADDING, getCell } from './row.js'

// Retrieve the header row
export const getHeader = function ({ titles, stats }, statNames) {
  const emptyRowName = getEmptyRowName(titles)
  const headerCells = getHeaderCells(stats, statNames)
  return `${emptyRowName}${NAME_RIGHT_PADDING}${headerCells}`
}

// Retrieve the spaces left instead of combination name in the header
const getEmptyRowName = function (titles) {
  return ' '.repeat(getEmptyRowWidth(titles))
}

export const getEmptyRowWidth = function (titles) {
  return stringWidth(getCombinationName(titles))
}

const getHeaderCells = function (stats, statNames) {
  return statNames
    .map((statName) => getHeaderCell(stats, statName))
    .join(COLUMN_SEPARATOR)
}

// Retrieve a cell in the header row
const getHeaderCell = function (stats, statName) {
  const columnWidth = getColumnWidth(stats, statName)
  const headerName = STAT_TITLES[statName].padStart(columnWidth)
  return fieldColor(headerName)
}

export const getColumnWidth = function (stats, statName) {
  return stringWidth(getCell(stats, statName))
}
