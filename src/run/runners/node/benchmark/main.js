import { benchmarkLoop } from './loop.js'
import { measure } from './measure.js'

// Measure how long a task takes.
// Run the benchmark for a specific amount of time.
export const benchmark = async function ({
  main,
  before,
  after,
  duration,
  async,
  nowBias,
  loopBias,
  minTime,
}) {
  await initialMeasure(async, before)

  const result = await benchmarkLoop({
    main,
    before,
    after,
    duration,
    async,
    nowBias,
    loopBias,
    minTime,
  })
  return result
}

// For some reasons I ignore (likely engine optimizations), when `measure()`
// is benchmarking its first function, it's running much faster than for the
// next functions passed to it.
// We fix this by doing a cold start using an empty function.
// The `before()` and `async` arguments need to match what is used during
// the bias calculation.
const initialMeasure = async function (async, before) {
  const beforeFunc = before === undefined ? undefined : noop
  await measure({
    main: noop,
    before: beforeFunc,
    nowBias: 0,
    loopBias: 0,
    repeat: 1,
    async,
  })
}

// This needs to be a different function from the `noop` used during bias
// calculation.
// eslint-disable-next-line no-empty-function
const noop = function () {}
