import { addEmptyMeasure } from '../empty.js'

import { performBeforeAsync, performAfterAsync } from './before_after.js'
import { getDurationAsync } from './duration.js'

export const performLoopsAsync = async function ({
  main,
  before,
  after,
  repeat,
  maxLoops,
  mainMeasures,
  emptyMeasures,
}) {
  // eslint-disable-next-line fp/no-loops
  while (mainMeasures.length < maxLoops) {
    // eslint-disable-next-line no-await-in-loop
    await performLoopAsync({
      main,
      before,
      after,
      repeat,
      mainMeasures,
      emptyMeasures,
    })
  }
}

const performLoopAsync = async function ({
  main,
  before,
  after,
  repeat,
  mainMeasures,
  emptyMeasures,
}) {
  addEmptyMeasure(emptyMeasures)

  const beforeArgs = await performBeforeAsync(before, repeat)
  // eslint-disable-next-line fp/no-mutating-methods
  mainMeasures.push(await getDurationAsync(main, repeat, beforeArgs))
  await performAfterAsync(after, repeat, beforeArgs)
}