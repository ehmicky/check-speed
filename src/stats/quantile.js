// Retrieve quantiles of an array of floats.
// Array must be sorted and not empty.
export const getQuantiles = function (array, length) {
  return Array.from({ length: length + 1 }, (value, index) =>
    getQuantile(array, index / length),
  )
}

export const getQuantile = function (array, percentage) {
  const position = getQuantilePosition(array, percentage)

  if (Number.isInteger(position)) {
    return array[position]
  }

  return (
    array[Math.floor(position)] * (Math.ceil(position) - position) +
    array[Math.ceil(position)] * (position - Math.floor(position))
  )
}

export const getRoundedPosition = function (array, percentage) {
  return Math.round(getQuantilePosition(array, percentage))
}

const getQuantilePosition = function (array, percentage) {
  return (array.length - 1) * percentage
}
