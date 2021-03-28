import { binarySearch } from './binary_search.js'

// Retrieve histogram of an array of floats.
// Array must be sorted and not empty.
export const getHistogram = function ({
  array,
  lowIndex,
  highIndex,
  bucketCount,
}) {
  const length = highIndex - lowIndex + 1
  const low = array[lowIndex]
  const high = array[highIndex]

  const bucketEdges = getBucketEdges(low, high, bucketCount)

  const state = { startIndex: lowIndex - 1 }
  return Array.from({ length: bucketCount }, (value, bucketIndex) =>
    getBucket({ bucketIndex, array, bucketEdges, highIndex, length, state }),
  )
}

const getBucketEdges = function (low, high, bucketCount) {
  const bucketSize = (high - low) / bucketCount
  const bucketEdges = Array.from(
    { length: bucketCount },
    (value, bucketIndex) => low + bucketIndex * bucketSize,
  )
  // Avoids float precision roundoff error at the end by using `high` directly
  return [...bucketEdges, high]
}

const getBucket = function ({
  bucketIndex,
  array,
  highIndex,
  bucketEdges,
  length,
  state,
  state: { startIndex },
}) {
  const start = bucketEdges[bucketIndex]
  const end = bucketEdges[bucketIndex + 1]

  const endIndex = binarySearch(array, end, startIndex, highIndex)
  const frequency = (endIndex - startIndex) / length

  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  state.startIndex = endIndex

  return { start, end, frequency }
}

