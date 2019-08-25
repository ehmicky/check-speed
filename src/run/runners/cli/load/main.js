import { loadFile } from './file.js'
import { validateBenchmarkFile } from './validate/main.js'
import { getInitialVariables, getVariables } from './variables.js'
import { getShell } from './shell.js'
import { normalizeTasks } from './normalize.js'
import { addTasksVariations } from './variations.js'

// Load the benchmark file
export const loadBenchmarkFile = async function(taskPath, debug) {
  const entries = await loadFile(taskPath)
  validateBenchmarkFile(entries)

  const variables = getInitialVariables()
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
