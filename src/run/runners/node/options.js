import { validate } from 'jest-validate'
import filterObj from 'filter-obj'

// Validate runner options
export const getOpts = function(runOpts) {
  const runOptsA = filterObj(runOpts, isDefined)
  const runOptsB = normalizeVersions(runOptsA)

  validate(runOptsB, { exampleConfig: EXAMPLE_OPTS })

  const runOptsC = { ...DEFAULT_OPTS, ...runOptsB }
  return runOptsC
}

const isDefined = function(key, value) {
  return value !== undefined
}

// If versions is `MAJOR` or `MAJOR.MINOR`, yargs will parse it as a number
const normalizeVersions = function({ versions, ...runOpts }) {
  const versionsA = typeof versions === 'number' ? String(versions) : versions
  return { ...runOpts, versions: versionsA }
}

const DEFAULT_OPTS = {}

const EXAMPLE_OPTS = {
  ...DEFAULT_OPTS,
  versions: '12 10.5.0 8.0.0',
}
