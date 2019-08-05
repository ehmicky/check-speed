/* eslint-disable max-lines */
import yargs from 'yargs'

export const defineCli = function() {
  return yargs
    .options(CONFIG)
    .usage(USAGE)
    .example(MAIN_EXAMPLE, 'Run benchmarks')
    .example(LONG_EXAMPLE, 'Benchmark each task for 60 seconds')
    .help()
    .version()
    .strict()
}

const CONFIG = {
  config: {
    alias: 'c',
    string: true,
    requiresArg: true,
    describe: `JSON configuration file.
Can specify the same options as the CLI flags.
Default: "spyd.json" in the current directory or any parent directory`,
  },
  cwd: {
    string: true,
    requiresArg: true,
    describe: `Current directory.
Used to find the default configuration and tasks files.`,
  },
  duration: {
    alias: 'd',
    number: true,
    requiresArg: true,
    describe: `How many seconds to benchmark each task.
Default: 10`,
  },
  report: {
    describe: `Module to report benchmark final results.
Built-in reporters: silent.
Custom reporters (installed with npm) can also be used.
Uses a dot notation such as --report.json (not --report=json nor --report json).
Reporter-specific options can be specified using the same dot notation.
The following options can be set for any reporter: output, insert, system, link.
For example --report.json.output is like --output but only for the json reporter.`,
  },
  progress: {
    describe: `Module to report benchmark progress.
Built-in reporters: silent.
Custom progress reporters (installed with npm) can also be used.
Uses a dot notation such as --progress.bar (not --progress=bar nor --progress bar).`,
  },
  output: {
    alias: 'o',
    string: true,
    requiresArg: true,
    describe: `Overwrite the specified file with the benchmark results.
Can be "" for silent output.
Can be "-" to print to stdout.
Default: "" if --insert is used, "-" otherwise.`,
  },
  insert: {
    alias: 'i',
    string: true,
    requiresArg: true,
    describe: `Insert the benchmark results inside the specified file.
The file must contain:
  - a line with the words "spyd-start" such as <!-- spyd-start --> or #spyd-start
  - a line with the words "spyd-end"
The benchmarks results will be inserted between those two lines.`,
  },
  system: {
    boolean: true,
    describe: `Show hardware and software information.
Default: false`,
  },
  verbose: {
    boolean: true,
    describe: `Show advanced statistics.
Default: false`,
  },
  link: {
    boolean: true,
    describe: `Show link to the library's main page.
Default: true`,
  },
  require: {
    string: true,
    array: true,
    requiresArg: true,
    describe: 'Module to load before the task file.',
  },
}

const USAGE = `$0 [OPTIONS] [FILE...]

Benchmark JavaScript code.

FILE defaults to "./benchmarks.js|ts" or "./benchmarks/main.js|ts".

FILE must export the tasks to benchmark. Each task must be either:
  - a function
  - an object with any of the following properties:

  main()      Function being benchmarked.
              Can be async.
              Required.

  before()    Function fired before each main(). Not benchmarked.
              Can be async.
              Its return value is passed as argument to main() and after().
              If the return value is not modified by main(), using a top-level
              variable instead of before() is preferred.

  after()     Function fired after each main(). Not benchmarked.
              Can be async.

  title       Title shown by reporters.
              Defaults to the task variable name.                       [string]

  variations  Ids of the variations this task should benchmark.
              Defaults to all available variations.                   [string[]]

FILE can also export a 'variations' array. One benchmark per combination of
tasks and variations are run. Each variation is an object with the following
properties:

  id          Variation identifier.
              Required.                                                 [string]

  title       Title shown by reporters.
              Defaults to the variation 'id'.                           [string]

  value       Passed as first argument to tasks main(), before() and
              after().                                                     [any]

Several FILEs can be specified at once. Each set of 'variations' is specific to
the FILE which declared it.`

const MAIN_EXAMPLE = '$0'
const LONG_EXAMPLE = '$0 -d 60'
/* eslint-enable max-lines */
