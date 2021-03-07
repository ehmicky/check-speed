// TODO: shortcuts for:
//  - counts.length === length
//  - counts.length % length === 0
//  - length % counts.length === 0
export const interpolateHistogram = function (counts, length) {
  const countsLength = counts.length

  if (length === 0 || countsLength === 0) {
    return []
  }

  const parts = []
  getIndexes(length + 1).reduce(
    ([previousInteger, previousFraction], index) => {
      const startIndex = (countsLength * index) / length
      const integer = Math.floor(startIndex)
      const fraction = startIndex - integer

      if (previousInteger !== undefined) {
        const sum =
          getStartSum(
            previousInteger,
            previousFraction,
            integer,
            fraction,
            counts,
          ) +
          getMiddleSum(previousInteger, integer, counts) +
          getEndSum(previousInteger, integer, fraction, counts)
        // eslint-disable-next-line fp/no-mutating-methods
        parts.push(sum)
      }

      return [integer, fraction]
    },
    [],
  )
  return parts
}

const getIndexes = function (length) {
  return Array.from({ length }, getIndex)
}

const getIndex = function (_, index) {
  return index
}

const getStartSum = function (
  previousInteger,
  previousFraction,
  integer,
  fraction,
  counts,
) {
  return (
    counts[previousInteger] *
    ((previousInteger === integer ? fraction : 1) - previousFraction)
  )
}

const getMiddleSum = function (previousInteger, integer, counts) {
  // eslint-disable-next-line fp/no-let
  let middleSum = 0

  // eslint-disable-next-line fp/no-loops, fp/no-mutation, fp/no-let
  for (let index = previousInteger + 1; index < integer; index += 1) {
    // eslint-disable-next-line fp/no-mutation
    middleSum += counts[index]
  }

  return middleSum
}

const getEndSum = function (previousInteger, integer, fraction, counts) {
  return fraction === 0 || previousInteger === integer
    ? 0
    : counts[integer] * fraction
}

const exampleCountsA = [5, 10, 5, 10, 5, 10, 5, 10, 5]
console.log(interpolateHistogram(exampleCountsA, 9))
console.log(interpolateHistogram(exampleCountsA, 4))
console.log(interpolateHistogram(exampleCountsA, 3))
console.log(interpolateHistogram(exampleCountsA, 1))

const exampleCountsB = [5, 10, 5]
console.log(interpolateHistogram(exampleCountsB, 6))
console.log(interpolateHistogram(exampleCountsB, 5))
console.log(interpolateHistogram(exampleCountsB, 2))

const exampleCountsC = [5, 10]
console.log(interpolateHistogram(exampleCountsC, 2))
console.log(interpolateHistogram(exampleCountsC, 3))

const exampleCountsD = [5]
console.log(interpolateHistogram(exampleCountsD, 3))
