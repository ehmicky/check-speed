import { isPlainObject } from '../../../../../utils/main.js'

import { validateTasks } from './tasks.js'
import { validateVariations } from './variation.js'

// Validate that tasks and variations have correct shape
export const validateBenchmarkFile = function(entries) {
  if (!isPlainObject(entries) || entries.default !== undefined) {
    throw new TypeError(`Benchmark file must use named exports`)
  }

  if (entries.tasks === undefined) {
    throw new TypeError(`Missing property 'tasks'`)
  }

  Object.entries(entries).forEach(validateEntry)
}

const validateEntry = function([name, entry]) {
  const validator = VALIDATORS[name]

  if (validator === undefined) {
    throw new TypeError(`Unknown property '${name}'`)
  }

  validator(entry)
}

const VALIDATORS = {
  variations: validateVariations,
  tasks: validateTasks,
}
