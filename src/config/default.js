import { cwd as getCwd } from 'process'

import { isTtyInput, isTtyOutput } from '../report/tty.js'

// Add default configuration properties
export const addDefaultConfig = function (config, command) {
  return {
    ...DEFAULT_CONFIG,
    cwd: getCwd(),
    quiet: !isTtyInput() || !isTtyOutput(),
    force: !isTtyInput(),
    showSystem: config.system !== undefined,
    showMetadata: METADATA_COMMANDS.has(command),
    ...config,
  }
}

const METADATA_COMMANDS = new Set(['show', 'remove'])

// We default `runner` to `node` only instead of several ones (e.g. `cli`)
// because this enforces that the `runner` property points to a required tasks
// file, instead of to an optional one. This makes behavior easier to understand
// for users and provides with better error messages.
export const DEFAULT_CONFIG = {
  precision: 2,
  concurrency: 1,
  system: 'default_system',
  save: false,
  limit: [],
  delta: 1,
  since: 0,
  titles: {},
  output: 'stdout',
  showTitles: false,
  showPrecision: false,
  select: [],
  runner: ['node'],
  reporter: ['debug'],
  tasks: 'tasks.*',
  inputs: {},
}
