import { separatorColor } from '../../utils/colors.js'
import { SEPARATOR_SIGN } from '../../utils/separator.js'

// List of columns, with their `stats.*` property
export const STAT_COLUMNS = [
  'median',
  'mean',
  'min',
  'low',
  'high',
  'max',
  'diff',
  'deviation',
  'moe',
  'times',
  'loops',
  'repeat',
  'samples',
  'minLoopDuration',
]

// Separators between columns
export const COLUMN_SEPARATOR = separatorColor(` ${SEPARATOR_SIGN} `)
