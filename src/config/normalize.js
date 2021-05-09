import { normalizeDelta } from '../delta/main.js'
import { normalizePrecision } from '../measure/precision.js'

import {
  normalizeOptionalArray,
  checkArrayLength,
  checkStringArray,
  checkDefinedStringArray,
  checkDefinedString,
  checkJson,
} from './check.js'

// Normalize configuration shape and do custom validation
export const normalizeConfig = function (config) {
  return Object.entries(NORMALIZERS).reduce(normalizeProp, config)
}

const normalizeProp = function (config, [propName, normalizer]) {
  const { [propName]: value, ...configA } = config
  const props = normalizer(value, propName, configA)

  if (props === undefined) {
    return config
  }

  return { ...configA, ...props }
}

// In order to pass dynamic information, the user should either:
//  - use shell features like subshells and environment variable expansion
//  - use `SPYD_*` environment variables
const normalizeSystem = function (system) {
  return { systemId: system }
}

const normalizeDeltaProp = function (delta, propName, { envInfo }) {
  return { [propName]: normalizeDelta(delta, propName, envInfo) }
}

const normalizeRunner = function (value, propName) {
  const valueA = normalizeOptionalArray(value)
  checkDefinedStringArray(valueA, propName)
  checkArrayLength(valueA, propName)
  return { [propName]: valueA }
}

const normalizeSelect = function (value, propName) {
  const valueA = normalizeOptionalArray(value)
  checkStringArray(valueA, propName)
  return { [propName]: valueA }
}

const selectReporter = function (value, propName) {
  const valueA = normalizeOptionalArray(value)
  checkDefinedStringArray(valueA, propName)
  return { [propName]: valueA }
}

const selectLimit = selectReporter

const checkTitles = function (value, propName) {
  Object.entries(value).forEach(([childName, propValue]) => {
    checkDefinedString(propValue, `${propName}.${childName}`)
  })
}

const checkInputs = function (value, propName) {
  Object.entries(value).forEach(([childName, propValue]) => {
    checkJson(propValue, `${propName}.${childName}`)
  })
}

const NORMALIZERS = {
  precision: normalizePrecision,
  system: normalizeSystem,
  delta: normalizeDeltaProp,
  since: normalizeDeltaProp,
  runner: normalizeRunner,
  reporter: selectReporter,
  select: normalizeSelect,
  limit: selectLimit,
  titles: checkTitles,
  inputs: checkInputs,
}
