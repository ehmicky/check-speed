import { env } from 'process'

import { loadYamlFile } from '../../../../utils/yaml.js'

import { normalizeTasks } from './normalize.js'
import { getShell } from './shell.js'
import { validateFile } from './validate.js'
import { getVariables } from './variables.js'
import { addTasksVariations } from './variations.js'

// Load the benchmark file
export const loadBenchmarkFile = async function (taskPath, debug) {
  const entries = await loadYamlFile(taskPath)
  validateFile(entries)

  const variables = env
  const { shell, entries: entriesA } = getShell(entries, variables)
  const { variables: variablesA, entries: entriesB } = await getVariables({
    entries: entriesA,
    variables,
    shell,
    debug,
  })

  const { tasks, variations } = normalizeTasks(entriesB, variablesA)
  const iterations = addTasksVariations({
    tasks,
    variations,
    variables: variablesA,
  })
  return { iterations, shell }
}
