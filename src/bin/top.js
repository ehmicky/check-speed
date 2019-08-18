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
Environment variables can also be used, prefixed with "SPYD_". For example
SPYD_JOB=same is like --job same and SPYD_RUN_NODE_VERSIONS 8 is like
--run.node.versions 8.
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
  tasks: {
    alias: 't',
    string: true,
    array: true,
    requiresArg: true,
    describe: `Identifiers of the tasks to benchmark.
Each identifier can start with a ! to exclude the task instead of selecting it.
Default: all tasks`,
  },
  variations: {
    alias: 'v',
    string: true,
    array: true,
    requiresArg: true,
    describe: `Identifiers of the variations to benchmark.
Each identifier can start with a ! to exclude the variation instead of selecting it.
Default: all variations`,
  },
  job: {
    string: true,
    requiresArg: true,
    describe: `Identifier of the current job.
Running several benchmarks with the same 'job' reports them together.
Used to create a single benchmark incrementally.
The value can be "same" to re-use the previous benchmark's job.
Default: random UUID`,
  },
  env: {
    string: true,
    requiresArg: true,
    describe: `Name of the current hardware/software environment.
Used to compare different machines or configurations together.
Meant to be used together with the 'job' option.
Default: ""`,
  },
  run: {
    describe: `Module to run benchmarks for a specific programming language or
platform.
Built-in runners: node.
Custom runners (installed with npm) can also be used.
Uses a dot notation such as --run.node (not --run=node nor --run node).
Runner-specific options can be specified using the same dot notation such as
--run.node.require.`,
  },
  report: {
    describe: `Module to report benchmarks.
Built-in reporters: silent.
Custom reporters (installed with npm) can also be used.
Uses a dot notation such as --report.json (not --report=json nor --report json).
Reporter-specific options can be specified using the same dot notation.
The following options can be set for any reporter: output, insert, colors,
system, link.
For example --report.json.output is like --output but only for the json reporter.`,
  },
  progress: {
    describe: `Module to report benchmark progress.
Built-in progress reporters: silent.
Custom progress reporters (installed with npm) can also be used.
Uses a dot notation such as --progress.bar (not --progress=bar nor --progress bar).`,
  },
  output: {
    alias: 'o',
    string: true,
    requiresArg: true,
    describe: `Overwrite the specified file with the benchmarks.
Can be "" for silent output.
Can be "-" to print to stdout.
Default: "" if --insert is used, "-" otherwise.`,
  },
  insert: {
    alias: 'i',
    string: true,
    requiresArg: true,
    describe: `Insert the benchmarks inside the specified file.
The file must contain:
  - a line with the words "spyd-start" such as <!-- spyd-start --> or #spyd-start
  - a line with the words "spyd-end"
The benchmarks will be inserted between those two lines.`,
  },
  colors: {
    boolean: true,
    describe: `Use colors in output.
Default: true if the terminal is interactive`,
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
  save: {
    boolean: true,
    describe: `Save the benchmarks.
Default: false`,
  },
  data: {
    string: true,
    requiresArg: true,
    describe: `Directory where the benchmarks are saved.
Default: '{packageRoot}/spyd/'`,
  },
  store: {
    describe: `Modules to save benchmarks.
Built-in stores: file.
Custom stores (installed with npm) can also be used.
Which store is used depends on the 'data' option format. For example the http
store is picked when the 'data' option is an HTTP URL.
Uses a dot notation such as --store.file (not --store=file nor --store file).`,
  },
  show: {
    describe: `Show a previous benchmark.
Can be:
  - false (default value)
  - true: show the last benchmark
  - integer: show the {integer} previous benchmark
  - timestamp: show the last benchmark before this timestamp.
    Timestamp can be a date or a date + time.
    Examples of valid timstamps include: 'yyyy-mm-dd', 'yyyy-mm-dd hh:mm:ss'.`,
  },
  diff: {
    describe: `Compare difference with a previous benchmark.
Can be false, true, integer or timestamp (like the 'show' option).
Default: true`,
  },
  remove: {
    describe: `Remove a previous benchmark.
Can be false, true, integer or timestamp (like the 'show' option).
Default: false`,
  },
}

const USAGE = `$0 [OPTIONS] [FILE...]

Benchmark JavaScript code.

FILE can be a globbing pattern.
It defaults to "./benchmarks.*" or "./benchmarks/main.*".

Each FILE must export the tasks to benchmark.

Several FILEs can be specified at once. Each set of 'variations' is specific to
the FILE which declared it.

The format of the FILE is runner-specific. For example for Node.js, each task
must be an object with any of the following properties:

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

In Node.js, FILE can also export a 'variations' array. One benchmark per
combination of tasks and variations are run. Each variation is an object with
the following properties:

  id          Variation identifier.
              Required.                                                 [string]

  title       Title shown by reporters.
              Defaults to the variation 'id'.                           [string]

  value       Passed as first argument to tasks main(), before() and
              after().                                                     [any]`

const MAIN_EXAMPLE = '$0'
const LONG_EXAMPLE = '$0 -d 60'
/* eslint-enable max-lines */
