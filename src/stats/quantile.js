import { getOutliersMax } from './outliers.js'

// Retrieve quantiles of an array of floats.
// Array must be sorted and not empty.
export const getQuantiles = function (array, length, threshold) {
  return Array.from({ length: length + 1 }, (value, index) =>
    getQuantile(array, index / length, threshold),
  )
}

export const getQuantile = function (array, percentage, threshold) {
  const outliersMax = getOutliersMax(array, threshold)
  const position = (outliersMax - 1) * percentage

  if (Number.isInteger(position)) {
    return array[position]
  }

  return (
    array[Math.floor(position)] * (Math.ceil(position) - position) +
    array[Math.ceil(position)] * (position - Math.floor(position))
  )
}