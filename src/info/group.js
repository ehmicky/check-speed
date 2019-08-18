import { omitBy } from '../utils/main.js'
import { groupBy } from '../utils/group.js'
import { sortBy } from '../utils/sort.js'
import { getMean } from '../stats/methods.js'

export const addGroups = function(iterations) {
  const tasks = getTasks(iterations)
  const variations = getVariations(iterations)
  const commands = getCommands(iterations)
  const iterationsA = iterations.map(iteration =>
    addGroupIndexes({ iteration, tasks, variations, commands }),
  )
  return { tasks, variations, commands, iterations: iterationsA }
}

// Retrieve all tasks.
// Also compute the mean of all iterations medians (of the same task)
// The array is sorted by mean.
const getTasks = function(iterations) {
  const tasks = groupIterations(iterations, 'taskId')
  const tasksA = tasks.map(getTask)
  return tasksA
}

const getTask = function({ groupId: taskId, mean, iteration: { taskTitle } }) {
  return { taskId, taskTitle, mean }
}

// Same for variations
const getVariations = function(iterations) {
  const variations = groupIterations(iterations, 'variationId')
  const variationsA = variations.map(getVariation)
  return variationsA
}

const getVariation = function({
  groupId: variationId,
  mean,
  iteration: { variationTitle },
}) {
  return { variationId, variationTitle, mean }
}

// Same for runner commands
const getCommands = function(iterations) {
  const commands = groupIterations(iterations, 'commandId')
  const commandsA = commands.map(getCommand)
  return commandsA
}

const getCommand = function({
  groupId: commandId,
  mean,
  iteration: { commandTitle },
}) {
  return { commandId, commandTitle, mean }
}

const groupIterations = function(iterations, groupId) {
  const groups = Object.entries(groupBy(iterations, [groupId]))

  const groupsA = groups.map(getGroupMean)
  sortBy(groupsA, ['mean'])
  return groupsA
}

const getGroupMean = function([groupId, iterations]) {
  const medians = iterations.map(getIterationMedian)
  const mean = getMean(medians)
  const [iteration] = iterations
  return { groupId, mean, iteration }
}

const getIterationMedian = function({ stats: { median } }) {
  return median
}

// Replace group id/title by index towards top-level group
const addGroupIndexes = function({
  iteration,
  iteration: { taskId, variationId, commandId },
  tasks,
  variations,
  commands,
}) {
  const iterationA = omitBy(iteration, key => GROUP_KEYS.includes(key))

  const taskA = tasks.findIndex(task => task.taskId === taskId)
  const variationA = variations.findIndex(
    variation => variation.variationId === variationId,
  )
  const commandA = commands.findIndex(
    variation => variation.commandId === commandId,
  )
  return {
    ...iterationA,
    task: taskA,
    variation: variationA,
    command: commandA,
  }
}

const GROUP_KEYS = [
  'taskId',
  'taskTitle',
  'variationId',
  'variationTitle',
  'commandId',
  'commandTitle',
]
