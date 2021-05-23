import { getFirstCellWidth } from '../../utils/first.js'
import { SEPARATOR_WIDTH } from '../../utils/separator.js'

import { getHeaderName } from './header.js'
import { getStatLength } from './row.js'

// Each column is padded to the same width, so that they align vertically
export const getColumnWidth = function ([{ stats }]) {
  return Math.max(...COLUMNS.map((column) => getStatColumnWidth(stats, column)))
}

const getStatColumnWidth = function (stats, column) {
  return Math.max(getStatLength(stats, column), getHeaderName(column).length)
}

// Group all column names into several tables so they fit the screen width
export const getAllColumns = function (
  [combination],
  screenWidth,
  columnWidth,
) {
  const availableWidth = screenWidth - getFirstCellWidth(combination)
  const { allColumns } = COLUMNS.reduce(
    addColumn.bind(undefined, { availableWidth, columnWidth }),
    { allColumns: [], remainingWidth: 0 },
  )
  // eslint-disable-next-line fp/no-mutating-methods
  return allColumns.reverse()
}

const addColumn = function (
  { availableWidth, columnWidth },
  { allColumns, allColumns: [columns, ...previousColumns], remainingWidth },
  column,
) {
  const remainingWidthA = remainingWidth - columnWidth - SEPARATOR_WIDTH
  return remainingWidthA >= 0
    ? {
        allColumns: [[...columns, column], ...previousColumns],
        remainingWidth: remainingWidthA,
      }
    : {
        allColumns: [[column], ...allColumns],
        remainingWidth: availableWidth - columnWidth,
      }
}

// List of columns, with their `stats.*` property
const COLUMNS = [
  'median',
  'medianLow',
  'medianHigh',
  'mean',
  'min',
  'low',
  'high',
  'max',
  'diff',
  'stdev',
  'rstdev',
  'moe',
  'rmoe',
  'times',
  'loops',
  'repeat',
  'samples',
  'minLoopDuration',
]
