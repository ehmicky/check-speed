import { startMeasuring } from '../../common/start.js'

import { performLoopsAsync } from './async/loops.js'
import { performLoopsSync } from './sync/loops.js'

// Call the `main` function iteratively and return an array of numbers measuring
// how long each call took.
export const measureTask = async function ({
  main,
  before,
  after,
  async,
  repeat,
  maxLoops,
  empty,
}) {
  const { mainMeasures, emptyMeasures } = startMeasuring(empty)
  await performLoops({
    main,
    before,
    after,
    async,
    repeat,
    maxLoops,
    mainMeasures,
    emptyMeasures,
  })
  return { mainMeasures, emptyMeasures }
}

// We separate async and sync measurements because following a promise (`await`)
// can take several microseconds, which does not work when measuring fast
// synchronous functions.
const performLoops = function ({
  main,
  before,
  after,
  async,
  repeat,
  maxLoops,
  mainMeasures,
  emptyMeasures,
}) {
  if (async) {
    return performLoopsAsync({
      main,
      before,
      after,
      repeat,
      maxLoops,
      mainMeasures,
      emptyMeasures,
    })
  }

  return performLoopsSync({
    main,
    before,
    after,
    repeat,
    maxLoops,
    mainMeasures,
    emptyMeasures,
  })
}
