import { v4 as uuidv4 } from 'uuid'

import { getSystem } from './system/info.js'
import { cleanObject } from './utils/clean.js'

// Add more information to the final partialResult and normalize/sort it
export const addResultInfo = function ({
  combinations,
  combinations: [{ systemId, systemTitle }],
  config: { cwd },
}) {
  const id = uuidv4()
  const timestamp = new Date().toISOString()
  const system = getSystem({ systemId, systemTitle, cwd })
  const partialResult = { id, timestamp, system, combinations }
  const partialResultA = cleanObject(partialResult)
  return partialResultA
}
