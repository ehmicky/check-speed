import { argv } from 'process'

import yargs from 'yargs'
// eslint-disable-next-line node/file-extension-in-import
import { hideBin } from 'yargs/helpers'

import { COMMANDS } from './commands/main.js'

// Define all CLI commands and flags
export const defineCli = function () {
  return (
    yargs(hideBin(argv))
      .command(COMMANDS.map(getCommand))
      .usage('')
      // Disable the default conversion made by yargs of dasherized CLI flags to
      // camelCase because user-defined identifiers can use dashes
      .parserConfiguration({ 'camel-case-expansion': false })
  )
}

const getCommand = function ({ command, describe, config, usage, examples }) {
  return {
    command,
    describe,
    builder: (commandYargs) =>
      commandYargs.options(config).usage(usage).example(examples),
  }
}
