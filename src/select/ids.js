// Retrieve user-defined identifiers: tasks, systems, variations, inputs
// They are checked for allowed characters.
// As opposed to plugin-defined identifiers: runners
export const getUserIds = function (combinations, inputs) {
  const combinationsIds = getCombinationsIds(combinations)
  const nonCombinationIds = getNonCombinationsIds(inputs)
  const userIds = [...combinationsIds, ...nonCombinationIds].filter(isUserId)
  return userIds
}

const isUserId = function ({ type }) {
  return USER_ID_TYPES.has(type)
}

const USER_ID_TYPES = new Set(['task', 'system', 'input'])

// Combination identifiers create a new dimension: tasks, systems, variations,
// runners. They:
//  - can be used in `include`, `exclude`, `limit`, etc.
//  - are checked for duplicates
// As opposed to non-combination identifiers: inputs.
// Retrieve all unique combinations identifiers.
// For all combinations of a given partialResult.
export const getCombinationsIds = function (combinations) {
  return combinations.flatMap(getIdInfos).filter(isNotSameTypeDuplicate)
}

// Same but for a single combination
export const getCombinationIds = function (combination) {
  return getIdInfos(combination).map(getId)
}

const getIdInfos = function (combination) {
  return COMBINATION_IDS.map(getIdInfo.bind(undefined, combination))
}

const COMBINATION_IDS = [
  { type: 'task', idName: 'taskId' },
  { type: 'system', idName: 'systemId' },
  { type: 'runner', idName: 'runnerId' },
]

const getIdInfo = function (combination, { type, idName }) {
  const id = combination[idName]
  return { type, id }
}

const getId = function ({ id }) {
  return id
}

// Remove duplicate ids with the same type, since this happens due to the
// cartesian product.
// Duplicate ids with a different type are validated later.
const isNotSameTypeDuplicate = function ({ type, id }, index, idInfos) {
  return !idInfos
    .slice(index + 1)
    .some((idInfo) => idInfo.type === type && idInfo.id === id)
}

// Retrieve non-combination identifiers.
const getNonCombinationsIds = function (inputs) {
  return NON_COMBINATION_IDS.flatMap(
    getNonCombinationIds.bind(undefined, inputs),
  )
}

const getNonCombinationIds = function (inputs, { type, getIds }) {
  return getIds(inputs).map((id) => ({ type, id }))
}

const getInputIds = function (inputs) {
  return inputs.map(getInputId)
}

const getInputId = function ({ inputId }) {
  return inputId
}

const NON_COMBINATION_IDS = [{ type: 'input', getIds: getInputIds }]