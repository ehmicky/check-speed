import { groupBy } from '../utils/group.js'
import { sortBy } from '../utils/sort.js'
import { getMean } from '../stats/methods.js'

// Group row/columns information into top-level properties so that reporters
// can list them.
// Also add the mean speed of each collection (using iterations medians).
export const addCollections = function(iterations) {
  return COLLECTIONS.reduce(addCollection, { iterations })
}

const COLLECTIONS = [
  { name: 'tasks', id: 'taskId', title: 'taskTitle', rank: 'taskRank' },
  {
    name: 'variations',
    id: 'variationId',
    title: 'variationTitle',
    rank: 'variationRank',
  },
  {
    name: 'commands',
    id: 'commandId',
    title: 'commandTitle',
    description: 'commandDescription',
    rank: 'commandRank',
  },
  { name: 'systems', id: 'systemId', title: 'systemTitle', rank: 'systemRank' },
]

const addCollection = function(
  { iterations, ...collections },
  { name, id, title, description, rank },
) {
  const collection = Object.values(groupBy(iterations, id)).map(iterationsA =>
    normalizeCollection({ iterations: iterationsA, id, title, description }),
  )
  sortBy(collection, ['mean'])

  const iterationsB = iterations.map(iteration =>
    addRank({ iteration, collection, id, rank }),
  )
  return { iterations: iterationsB, ...collections, [name]: collection }
}

const normalizeCollection = function({ iterations, id, title, description }) {
  const lastIteration = iterations[iterations.length - 1]
  const {
    [id]: collectionId,
    [title]: collectionTitle,
    [description]: collectionDescription,
  } = lastIteration

  const medians = iterations.map(getIterationMedian)
  const mean = getMean(medians)

  return {
    id: collectionId,
    title: collectionTitle,
    description: collectionDescription,
    mean,
  }
}

const getIterationMedian = function({ stats: { median } }) {
  return median
}

// Add speed rank within each collection for each iteration
const addRank = function({ iteration, collection, id, rank }) {
  const rankValue = collection.findIndex(elem => elem.id === iteration[id])
  return { ...iteration, [rank]: rankValue }
}
