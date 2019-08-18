import { cwd as getCwd, stderr } from 'process'

import { validate, multipleValidOptions } from 'jest-validate'
import isInteractive from 'is-interactive'

import { omitBy } from '../utils/main.js'

import { getConfig } from './config.js'
import { normalizeOpts } from './normalize.js'
import { loadAllPlugins } from './plugins.js'

// Retrieve options/configuration
export const getOpts = async function(opts = {}) {
  const optsA = omitBy(opts, isUndefined)

  validateOpts(optsA)

  const optsB = await getConfig({ opts: optsA })

  validateOpts(optsB)
  const optsC = { ...DEFAULT_OPTS, ...optsB }

  const optsD = await normalizeOpts(optsC)
  const optsE = await loadAllPlugins(optsD)
  return optsE
}

const isUndefined = function(value) {
  return value === undefined
}

// We need to do this twice because configuration loading needs to have
// `cwd` and `config` type checked, but it also adds new options.
const validateOpts = function(opts) {
  validate(opts, {
    exampleConfig: EXAMPLE_OPTS,
    recursiveBlacklist: ['run', 'report', 'progress', 'store'],
  })
}

const DEFAULT_OPTS = {
  files: ['benchmarks.*', 'benchmarks/main.*'],
  cwd: getCwd(),
  duration: 10,
  colors: isInteractive(stderr),
  verbose: false,
  link: true,
  system: false,
  save: false,
  run: { node: {} },
  report: { debug: {} },
  progress: { debug: {} },
  store: { file: {} },
  show: false,
  diff: true,
  remove: false,
}

const VALID_TIMESTAMPS = [
  'yyyy-mm-dd',
  'yyyymmdd',
  'yyyy-mm-dd hh:mm:ss',
  'yyyy-mm-dd hh:mm:ssZ',
  'yyyy-mm-ddThh:mm:ss.sss',
  'yyyy-mm-ddThh:mm:ss.sssZ',
]

const VALID_BENCHMARK_DELTA = multipleValidOptions(true, 3, ...VALID_TIMESTAMPS)

const EXAMPLE_OPTS = {
  ...DEFAULT_OPTS,
  config: 'spyd.json',
  tasks: ['taskId'],
  variations: ['variationId'],
  output: './file.js',
  insert: './README.md',
  data: './spyd',
  show: VALID_BENCHMARK_DELTA,
  diff: VALID_BENCHMARK_DELTA,
  remove: VALID_BENCHMARK_DELTA,
}
